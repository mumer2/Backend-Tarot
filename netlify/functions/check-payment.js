exports.handler = async (event) => {
  const orderId = event.queryStringParameters.orderId;

  // Replace this with your actual payment status check (DB, Firebase, etc.)
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing orderId" }),
    };
  }

  // Fake data for test:
  const mockPaid = orderId.includes("wx") || orderId.length > 5;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paid: mockPaid,
      amount: 10, // your real value from DB/Firebase
    }),
  };
};
