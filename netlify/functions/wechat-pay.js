const axios = require("axios");
const crypto = require("crypto");
const xml2js = require("xml2js");
require("dotenv").config();

const generateNonceStr = () => Math.random().toString(36).substring(2, 15);

exports.handler = async (event) => {
  try {
    const { total_fee = 1, out_trade_no } = JSON.parse(event.body || "{}");

    const appid = process.env.WECHAT_APPID;
    const mch_id = process.env.WECHAT_MCH_ID;
    const key = process.env.WECHAT_API_KEY;

    const notify_url = "https://backend-tarot.netlify.app/.netlify/functions/wechat-notify";
    const trade_type = "MWEB";

    const ip = event.headers["x-nf-client-connection-ip"] || "123.123.123.123";

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
      body: "Tarot Recharge",
      out_trade_no: out_trade_no || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      total_fee: total_fee.toString(),
      spbill_create_ip: ip,
      notify_url,
      trade_type,
      scene_info,
      sign_type: "MD5",
    };

    const stringA = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== "")
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const stringSignTemp = `${stringA}&key=${key}`;
    const sign = crypto.createHash("md5").update(stringSignTemp, "utf8").digest("hex").toUpperCase();

    const builder = new xml2js.Builder({ rootName: "xml", headless: true, cdata: true });
    const xmlData = builder.buildObject({ ...params, sign });

    const response = await axios.post(
      "https://api.mch.weixin.qq.com/pay/unifiedorder",
      xmlData,
      { headers: { "Content-Type": "text/xml; charset=utf-8" } }
    );

    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const result = parsed.xml;

    console.log("🟢 WeChat Pay response:", result);

    if (result.return_code === "SUCCESS" && result.result_code === "SUCCESS") {
      return {
        statusCode: 200,
        body: JSON.stringify({ mweb_url: result.mweb_url }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: result.return_msg || result.err_code_des || "WeChat Pay error",
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
