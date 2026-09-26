// api/discord.js - WAJIB BUAT BUTTON MUNCUL!
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDTkQVpME0XRQmk9Jo7eDQuf0OFY8stm_8",
  authDomain: "wafastoreonly.firebaseapp.com",
  databaseURL: "https://wafastoreonly-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wafastoreonly",
};

function getDB() {
  const app = getApps().length? getApps()[0] : initializeApp(firebaseConfig);
  return getDatabase(app);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('WafaStoreOnly Discord API ON ⚡ - Button Ready!');
  }
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Handle PING from Discord
    if (body.type === 1) {
      return res.status(200).json({ type: 1 });
    }

    const custom_id = body?.data?.custom_id || '';
    if (!custom_id) {
      return res.status(200).json({
        type: 4,
        data: { content: "❌ No action bos!", flags: 64 }
      });
    }

    const parts = custom_id.split('_');
    const action = parts[0]; // proses, selesai, batal
    const orderId = parts.slice(1).join('_');

    if (!orderId) {
      return res.status(200).json({
        type: 4,
        data: { content: "❌ ID tidak valid", flags: 64 }
      });
    }

    const db = getDB();
    let newStatus = 'verifikasi';
    if (action === 'proses') newStatus = 'proses';
    if (action === 'selesai') newStatus = 'selesai';
    if (action === 'batal') newStatus = 'batal';

    await update(ref(db, 'orders/' + orderId), { status: newStatus });

    let msg = '';
    if (newStatus === 'proses') msg = `⚡ **ORDER #${orderId.slice(-6)} DIPROSES!**\nBuyer udah dapet notif "sedang di proses 🥰"`;
    if (newStatus === 'selesai') msg = `✅ **ORDER #${orderId.slice(-6)} SELESAI!**\nBuyer udah dapet notif "sudah diterima transaksi done ✅ 📌 ticket akan terhapus otomatis dalam 10 menit + Terimakasih WafaStoreOnly🥰🙏" + auto hapus 10 menit`;
    if (newStatus === 'batal') msg = `❌ **ORDER #${orderId.slice(-6)} DIBATALKAN!**`;

    return res.status(200).json({
      type: 4,
      data: { content: msg, flags: 64 }
    });

  } catch (e) {
    console.error(e);
    return res.status(200).json({
      type: 4,
      data: { content: "❌ Error: " + e.message, flags: 64 }
    });
  }
}
