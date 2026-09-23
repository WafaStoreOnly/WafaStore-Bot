// api/create-ticket.js - JEMBATAN WEB -> DISCORD BOT
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { buyer, seller, nominal, fee, total } = req.body;
  const ref = `WAFA-${Date.now()}`;
  
  // Buat QRIS Pakasir
  let qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PAKASIR-${ref}-${total}`;
  
  try {
    // Panggil API Pakasir asli kalo ada key di Vercel Env
    if(process.env.PAKASIR_API_KEY){
      const resp = await fetch('https://api.pakasir.com/api/v1/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.PAKASIR_API_KEY,
          amount: total,
          reference: ref
        })
      });
      const data = await resp.json();
      if(data.data?.qr_image) qr_url = data.data.qr_image;
    }
  } catch(e){}

  // Kirim ke Discord Webhook / Bot Railway (opsional)
  if(process.env.DISCORD_WEBHOOK_URL){
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🎫 **NEW REKBER DARI WEB**\nRef: ${ref}\nBuyer: ${buyer}\nSeller: ${seller}\nTotal: Rp ${total}\nQR: ${qr_url}`
      })
    });
  }

  return res.json({ success: true, ref, qr_url, total });
}
