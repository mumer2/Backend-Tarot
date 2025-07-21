const axios = require("axios");
const crypto = require("crypto");
const xml2js = require("xml2js");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const generateNonceStr = () => Math.random().toString(36).substring(2, 15);

// Connect to MongoDB
const connectDB = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  return client.db("tarot-station"); // your DB name
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const total_fee = body.total_fee || 1; // WeChat requires fee in fen (cents)
    const userId = (body.userId || "guest").toString();

    // Short merchant order number (<32 bytes)
    const shortUserId = userId.slice(0, 6);
    const out_trade_no = `U${shortUserId}${Date.now().toString().slice(-10)}`;

    // WeChat config
    const appid = process.env.WECHAT_APPID;
    const mch_id = process.env.WECHAT_MCH_ID;
    const key = process.env.WECHAT_API_KEY;
    const notify_url = "https://backend-tarot.netlify.app/.netlify/functions/wechat-notify";
    const trade_type = "MWEB";

    const scene_info = JSON.stringify({
      h5_info: {
        type: "Wap",
        wap_url: "https://tarot-station.netlify.app", // must match your domain
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

    // Generate signature
    const stringA = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== "")
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const stringSignTemp = `${stringA}&key=${key}`;
    const sign = crypto.createHash("md5").update(stringSignTemp, "utf8").digest("hex").toUpperCase();

    // Convert to XML
    const builder = new xml2js.Builder({ rootName: "xml", headless: true, cdata: true });
    const xmlData = builder.buildObject({ ...params, sign });

    // Send to WeChat unifiedorder API
    const response = await axios.post(
      "https://api.mch.weixin.qq.com/pay/unifiedorder",
      xmlData,
      { headers: { "Content-Type": "text/xml; charset=utf-8" } }
    );

    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const result = parsed.xml;

    console.log("🟢 WeChat Pay Response:", result);

    if (result.return_code === "SUCCESS" && result.result_code === "SUCCESS") {
      // Store initial pending order in DB (optional but useful)
      const db = await connectDB();
      await db.collection("wechat_orders").insertOne({
        out_trade_no,
        userId,
        total_fee,
        status: "PENDING",
        createdAt: new Date(),
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          mweb_url: result.mweb_url,
          out_trade_no,
        }),
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
