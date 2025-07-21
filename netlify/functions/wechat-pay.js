const axios = require("axios");
const crypto = require("crypto");
const xml2js = require("xml2js");
require("dotenv").config();

// Helper: Generate random string
const generateNonceStr = () => Math.random().toString(36).substring(2, 15);

exports.handler = async (event) => {
  try {
    // Step 1: Parse request
    const body = JSON.parse(event.body || "{}");
    const total_fee = body.total_fee || 1; // In fen (cents)
    const userId = (body.userId || "guest").toString();

    // Step 2: Build short and unique out_trade_no
    const shortUserId = userId.slice(0, 6);
    const out_trade_no = `U${shortUserId}${Date.now().toString().slice(-10)}`; // < 32 chars

    // Step 3: WeChat Credentials
    const appid = process.env.WECHAT_APPID;
    const mch_id = process.env.WECHAT_MCH_ID;
    const key = process.env.WECHAT_API_KEY;

    // Step 4: Payment request fields
    const notify_url = "https://backend-tarot.netlify.app/.netlify/functions/wechat-notify";
    const trade_type = "MWEB";

    const scene_info = JSON.stringify({
      h5_info: {
        type: "Wap",
        wap_url: "https://tarot-station.netlify.app",
        wap_name: "Tarot Station",
      },
    });

    const params = {
      appid,
      mch_id,
      nonce_str: generateNonceStr(),
      body: "Tarot Wallet Recharge",
      out_trade_no,
      total_fee: total_fee.toString(),
      spbill_create_ip: "127.0.0.1",
      notify_url,
      trade_type,
      scene_info,
    };

    // Step 5: Generate sign
    const stringA = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== "")
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const stringSignTemp = `${stringA}&key=${key}`;
    const sign = crypto.createHash("md5").update(stringSignTemp, "utf8").digest("hex").toUpperCase();

    // Step 6: Convert to XML
    const builder = new xml2js.Builder({ rootName: "xml", headless: true, cdata: true });
    const xmlData = builder.buildObject({ ...params, sign });

    // Step 7: Send request to WeChat API
    const response = await axios.post("https://api.mch.weixin.qq.com/pay/unifiedorder", xmlData, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });

    // Step 8: Parse XML response
    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const result = parsed.xml;

    console.log("🟢 WeChat Pay Response:", result);

    if (result.return_code === "SUCCESS" && result.result_code === "SUCCESS") {
      return {
        statusCode: 200,
        body: JSON.stringify({ mweb_url: result.mweb_url }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: result.return_msg || result.err_code_des || "WeChat error",
          raw: result,
        }),
      };
    }
  } catch (err) {
    console.error("WeChat Pay Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unexpected error" }),
    };
  }
};
