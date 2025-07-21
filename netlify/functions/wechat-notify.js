// netlify/functions/wechat-notify.js
const xml2js = require("xml2js");
const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  const xml = event.body;
  const parsed = await parser.parseStringPromise(xml);
  const result = parsed.xml;

  if (result.result_code === "SUCCESS") {
    const outTradeNo = result.out_trade_no; // e.g., userId-timestamp
    const [userId] = outTradeNo.split("-");
    const totalFee = parseInt(result.total_fee) / 100;

    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db("your-db");
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $inc: { walletBalance: totalFee },
        $push: { walletHistory: { amount: totalFee, date: new Date() } },
      }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
    };
  }

  return {
    statusCode: 400,
    headers: { "Content-Type": "text/xml" },
    body: `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[FAIL]]></return_msg></xml>`,
  };
};
