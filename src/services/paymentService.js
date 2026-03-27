export const createPaymentOrder = async (amount, uid, mobile) => {

  const response = await fetch(
    "https://neoupi-backend.onrender.com/create-order",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        uid,
        mobile,
      }),
    }
  );

  return response.json();
};
