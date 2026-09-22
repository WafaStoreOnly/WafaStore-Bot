const axios = require('axios');
module.exports.createTransaction = async (amount, ref, buyer) => {
  const apiKey = process.env.PAKASIR_API_KEY;
  if (!apiKey) {
    return { qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=WAFA-${ref}-${amount}` };
  }
  try {
    const res = await axios.post('https://app.pakasir.com/api/v1/transaction/create', {
      api_key: apiKey, amount, merchant_ref: ref, customer_name: buyer
    });
    return { qr_url: res.data.data?.qr_url || res.data.qr_url };
  } catch (e) {
    return { qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=WAFA-${ref}-${amount}` };
  }
};
