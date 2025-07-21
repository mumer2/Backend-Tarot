const xml2js = require("xml2js");
const crypto = require("crypto");

exports.handler = async (event) => {
  const xml = event.body;
  const parser = new xml2js.Parser({ explicitArray: false });
  const builder = new xml2js.Builder({ rootName: "xml", headless: true, cdata: true });

  try {
    const parsed = await parser.parseStringPromise(xml);
    const data = parsed.xml;

    if (data.result_code === "SUCCESS" && data.return_code === "SUCCESS") {
      // ✅ Save payment info to Firebase, MongoDB, etc.
      const orderId = data.out_trade_no;
      const total = parseInt(data.total_fee); // in fen
      const amount = total / 100;

      // Example: Save it in a temporary store (like Firebase or DB)
      // await saveToFirebaseOrDB(orderId, amount);

      console.log("✅ REAL PAYMENT RECEIVED", { orderId, amount });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/xml" },
        body: builder.buildObject({
          return_code: "SUCCESS",
          return_msg: "OK",
        }),
      };
    } else {
      console.warn("⚠️ Failed payment", data);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/xml" },
        body: builder.buildObject({
          return_code: "FAIL",
          return_msg: "Payment Failed",
        }),
      };
    }
  } catch (err) {
    console.error("❌ notify error", err);
    return {
      statusCode: 500,
      body: "Notify handler failed",
    };
  }
};
