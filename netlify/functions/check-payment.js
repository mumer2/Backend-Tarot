exports.handler = async (event) => {
  const orderId = event.queryStringParameters.orderId;

  // Replace with your DB or Firebase check
  const paymentData = await checkFirebaseOrDB(orderId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      paid: paymentData?.paid || false,
      amount: paymentData?.amount || 0,
    }),
  };
};
