require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, UserSelectMenuBuilder } = require('discord.js');
const express = require('express');
const path = require('path');
const db = require('./db');
const { createTransaction } = require('./pakasir');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/api/harga', (req, res) => res.json({ toko: "WafaStoreOnly.cloud", status: "READY FINAL" }));

const LOGS_CHANNEL_ID = process.env.LOGS_CHANNEL_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;

function getFee(n){
  if(n<=50000) return 3000;
  if(n<=100000) return 6000;
  if(n<=150000) return 9000;
  if(n<=200000) return 12000;
  if(n<=300000) return 15000;
  if(n<=500000) return 20000;
  return Math.floor(n*0.05);
}
async function autoCloseTicket(channel, ref, delay=10*60*1000){
  await channel.send(`⏰ Ticket ${ref} tutup otomatis 10 menit! Screenshot bukti ya!`).catch(()=>{});
  setTimeout(async()=>{ try{ await channel.send(`🔒 Ticket ${ref} ditutup...`); setTimeout(()=>channel.delete().catch(()=>{}),3000);}catch(e){} }, delay);
}
async function sendLog(embed){
  try{ const ch = await client.channels.fetch(LOGS_CHANNEL_ID); if(ch) ch.send({ embeds: [embed] }); }catch(e){}
}

client.on(Events.MessageCreate, async(msg)=>{
  if(msg.author.bot) return;
  if(msg.content === '!setuprekber' && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)){
    const embed = new EmbedBuilder()
  .setColor('#5865F2')
  .setAuthor({ name: 'WafaStoreOnly • Trusted Midman Service', iconURL: msg.guild.iconURL() })
  .setTitle('🤝 REKBER / MIDMAN SERVICES')
  .setDescription(`> **Transaksi Aman, Nyaman, 100% Terpercaya di WafaStoreOnly.**\n\n🔹 **Layanan:** All Game / Akun / Jasa\n🔹 **Jam:** 08.00 - 23.00 WIB\n🔹 **Proses:** 5 - 15 Menit`)
  .addFields(
       { name: '⚠️ Tata Cara', value: '`1.` Klik Tombol\n`2.` Pilih Lawan (KLIK nama)\n`3.` Isi Nominal\n`4.` Ticket auto dibuat', inline: false },
       { name: '💎 Kenapa WafaStore?', value: '✅ Fast Respon\n✅ Fee Mulai 3K\n✅ QRIS Pakasir\n✅ Anti Scam', inline: true },
       { name: '💳 Pembayaran', value: 'DANA: 083862776790\nQRIS: Otomatis', inline: true }
     )
  .setFooter({ text: 'WafaStoreOnly.cloud • Midman Terpercaya', iconURL: msg.guild.iconURL() })
  .setTimestamp();
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('Rekber? Klik Disini').setStyle(ButtonStyle.Primary).setEmoji('🛡️'));
    const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Cek Reputasi').setStyle(ButtonStyle.Link).setURL('https://wafastoreonly.cloud').setEmoji('⭐'), new ButtonBuilder().setLabel('Kontak Admin').setStyle(ButtonStyle.Link).setURL('https://wa.me/6283862776790').setEmoji('💬'));
    return msg.channel.send({ embeds: [embed], components: [row, row2] });
  }

  const ref = Object.keys(db.data.transactions).find(r => db.data.transactions[r].channelId === msg.channel.id);
  if(!ref) return;
  const trx = db.data.transactions[ref];

  if(msg.content.toLowerCase() === 'done'){
    if(trx.status === 'WAITING_PAYMENT') return msg.reply(`❌ Belum bisa done! Bayar QRIS Rp ${trx.total.toLocaleString('id-ID')} dulu.`);
    if(trx.status === 'PAID_HELD'){
      if(msg.author.id === trx.buyer) trx.doneBuyer = true;
      if(msg.author.id === trx.seller) trx.doneSeller = true;
      await db.write();
      if(trx.doneBuyer && trx.doneSeller){
        trx.status = 'WAITING_PAYOUT_INFO'; await db.write();
        return msg.channel.send(`✅ **KEDUA PIHAK DONE!**\nSeller <@${trx.seller}> ketik metode payout:\n\`DANA 0812... A/N\``);
      } else return msg.channel.send(`📝 <@${msg.author.id}> done! Buyer ${trx.doneBuyer?'✅':'❌'} | Seller ${trx.doneSeller?'✅':'❌'}`);
    }
  }
  if(trx.status === 'WAITING_PAYOUT_INFO' && msg.author.id === trx.seller && msg.content.length > 5){
    trx.payoutMethod = msg.content; trx.status = 'WAITING_SELLER_CONFIRM'; await db.write();
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`confirm_payout_${ref}`).setLabel('✅ KONFIRMASI KIRIM DANA').setStyle(ButtonStyle.Success));
    return msg.channel.send({ content: `💳 PAYOUT: ${msg.content}\nSeller terima Rp ${trx.amount.toLocaleString('id-ID')}`, components: [row] });
  }
  if(trx.status === 'WAITING_REFUND_INFO' && msg.author.id === trx.buyer && msg.content.length > 5){
    trx.refundMethod = msg.content; trx.status = 'REFUNDED'; await db.write();
    const log = new EmbedBuilder().setTitle('🔴 REFUND').setDescription(`Ref: ${ref}\nRefund: Rp ${trx.amount.toLocaleString('id-ID')} ke ${msg.content}`).setColor(0xFF0000).setTimestamp();
    await sendLog(log); await msg.channel.send(`✅ REFUND DIPROSES ke ${msg.content}`); return autoCloseTicket(msg.channel, ref);
  }
});

client.on(Events.InteractionCreate, async(i)=>{
  if(i.customId === 'create_ticket'){
    const select = new ActionRowBuilder().addComponents(new UserSelectMenuBuilder().setCustomId('select_lawan').setPlaceholder('👤 Pilih lawan transaksi - klik disini').setMinValues(1).setMaxValues(1));
    return i.reply({ content: '**Step 1/2: Pilih lawan kamu**\nKlik menu di bawah, terus **KLIK NAMA** orangnya (jangan ketik manual!)\n👇', components: [select], ephemeral: true });
  }
  if(i.customId === 'select_lawan'){
    const sellerId = i.values[0];
    if(sellerId === i.user.id) return i.reply({ content: '❌ Gabisa rekber sama diri sendiri!', ephemeral: true });
    const modal = new ModalBuilder().setCustomId(`modal_nominal_${sellerId}`).setTitle('Step 2/2 - Nominal Rekber');
    modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nominal').setLabel('Nominal transaksi').setStyle(TextInputStyle.Short).setPlaceholder('50000').setRequired(true)));
    return i.showModal(modal);
  }
  if(i.isModalSubmit() && i.customId.startsWith('modal_nominal_')){
    await i.deferReply({ ephemeral: true });
    const sellerId = i.customId.replace('modal_nominal_','');
    const seller = await client.users.fetch(sellerId).catch(()=>null);
    const nominal = parseInt(i.fields.getTextInputValue('nominal').replace(/[^0-9]/g,''));
    if(!seller || isNaN(nominal) || nominal < 1000) return i.editReply('❌ Nominal minimal 1000!');
    const fee = getFee(nominal); const total = nominal + fee; const ref = `WAFA-${Date.now()}`;
    const payment = await createTransaction(total, ref, i.user.username);
    const channel = await i.guild.channels.create({
      name: `ticket-${Math.floor(nominal/1000)}k-${ref.slice(-4).toLowerCase()}`, type: ChannelType.GuildText, parent: TICKET_CATEGORY_ID || null,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: seller.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });
    db.data.transactions[ref] = { ref, buyer: i.user.id, seller: seller.id, amount: nominal, fee, total, status: 'WAITING_PAYMENT', created: Date.now(), channelId: channel.id, qr_url: payment.qr_url, doneBuyer: false, doneSeller: false };
    await db.write();
    const embed = new EmbedBuilder().setTitle(`🔒 TICKET REKBER ${ref} | WafaStoreOnly`).setDescription(`Buyer: <@${i.user.id}>\nSeller: <@${seller.id}>\n\n**Harga:** Rp ${nominal.toLocaleString('id-ID')}\n**Fee:** Rp ${fee.toLocaleString('id-ID')}\n**TOTAL:** Rp ${total.toLocaleString('id-ID')}\n\n💳 DANA: 083862776790\nScan QRIS, berlaku 15 menit.`).setImage(payment.qr_url).setColor(0x5865F2).setFooter({ text: `Ref: ${ref}` });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`cancel_${ref}`).setLabel('❌ Batalkan (Buyer Only)').setStyle(ButtonStyle.Danger));
    await channel.send({ content: `<@${i.user.id}> <@${seller.id}>`, embeds: [embed], components: [row] });
    await i.editReply(`✅ Ticket dibuat di ${channel}\nTotal: Rp ${total.toLocaleString('id-ID')}`);
    setTimeout(async()=>{ const t=db.data.transactions[ref]; if(t&&t.status==='WAITING_PAYMENT'){ t.status='EXPIRED'; await db.write(); channel.send(`❌ Expired 15 menit.`).catch(()=>{}); autoCloseTicket(channel, ref, 2*60*1000); } }, 15*60*1000);
  }
  if(i.isButton()){
    const ref = i.customId.split('_').slice(1).join('_').replace('payout_','');
    const trx = db.data.transactions[ref]; if(!trx) return;
    if(i.customId.startsWith('cancel_')){
      if(i.user.id!== trx.buyer) return i.reply({ content: '❌ Hanya buyer!', ephemeral: true });
      trx.status = 'WAITING_REFUND_INFO'; await db.write();
      return i.reply(`❌ **DIBATALKAN**\n<@${trx.buyer}> isi refund: \`DANA 0812... A/N\``);
    }
    if(i.customId.startsWith('confirm_payout_')){
      if(i.user.id!== trx.seller) return i.reply({ content: '❌ Hanya seller!', ephemeral: true });
      trx.status = 'COMPLETED'; await db.write();
      const log = new EmbedBuilder().setTitle('✅ DONE').setDescription(`Ref: ${ref}\nBuyer: <@${trx.buyer}>\nSeller: <@${trx.seller}>\nNominal: Rp ${trx.amount.toLocaleString('id-ID')}\nPayout: ${trx.payoutMethod}`).setColor(0x00FF00).setTimestamp();
      await sendLog(log); await i.reply(`✅ **DANA TERKIRIM** Rp ${trx.amount.toLocaleString('id-ID')} ke ${trx.payoutMethod}`); return autoCloseTicket(i.channel, ref);
    }
  }
});

app.post('/webhook/pakasir', async(req,res)=>{
  const { merchant_ref, ref, status } = req.body;
  const key = merchant_ref || ref;
  const trx = db.data.transactions[key];
  if(!trx) return res.status(200).send('OK');
  if((status==='PAID'||status==='paid'||status==='success') && trx.status==='WAITING_PAYMENT'){
    trx.status='PAID_HELD'; trx.paidAt=Date.now(); await db.write();
    const ch = await client.channels.fetch(trx.channelId).catch(()=>null);
    if(ch) ch.send(`✅ **DANA MASUK Rp ${trx.total.toLocaleString('id-ID')}!** Silahkan lanjut, ketik done jika selesai.`);
  }
  res.send('OK');
});

if(!process.env.VERCEL){
  app.listen(process.env.PORT||3000, ()=>console.log('Web jalan'));
  client.login(process.env.BOT_TOKEN||process.env.DISCORD_TOKEN);
} else module.exports = app;
