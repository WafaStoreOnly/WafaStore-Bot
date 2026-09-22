require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const express = require('express');
const path = require('path');
const db = require('./db');
const { createTransaction } = require('./pakasir');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const app = express();
app.use(express.json());
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));

const LOGS_CHANNEL_ID = process.env.LOGS_CHANNEL_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;

function getFee(n){ if(n<=50000)return 3000; if(n<=100000)return 6000; if(n<=150000)return 9000; if(n<=200000)return 12000; if(n<=300000)return 15000; if(n<=500000)return 20000; return Math.floor(n*0.05); }
async function autoCloseTicket(channel,ref,delay=10*60*1000){
  await channel.send(`⏰ Ticket tutup otomatis 10 menit!\nBuyer & Seller wajib screenshot bukti!`).catch(()=>{});
  setTimeout(async()=>{ try{ await channel.send(`🔒 Ticket ${ref} ditutup.`); setTimeout(()=>channel.delete().catch(()=>{}),3000);}catch(e){} },delay);
}
async function sendLog(embed){ try{ const ch=await client.channels.fetch(LOGS_CHANNEL_ID); if(ch) ch.send({embeds:[embed]});}catch(e){} }

client.on(Events.MessageCreate, async(msg)=>{
  if(msg.author.bot) return;
  if(msg.content==='!setuprekber' && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)){
    const embed=new EmbedBuilder().setTitle('🔒 REKBER WafaStoreOnly | AUTO & AMAN').setDescription('**Transaksi Aman 100%**\n\nGamepass 14K/100 | Username 16K/100\nDANA 083862776790\n\nKlik tombol buat ticket rekber.').setColor(0x00BFFF);
    const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('🎫 CREATE TICKET').setStyle(ButtonStyle.Success));
    return msg.channel.send({embeds:[embed],components:[row]});
  }
  const ref=Object.keys(db.data.transactions).find(r=>db.data.transactions[r].channelId===msg.channel.id);
  if(!ref) return; const trx=db.data.transactions[ref];
  if(msg.content.toLowerCase()==='done'){
    if(trx.status==='WAITING_PAYMENT') return msg.reply(`❌ Belum bayar! Total Rp ${trx.total.toLocaleString('id-ID')}`);
    if(trx.status==='PAID_HELD'){
      if(msg.author.id===trx.buyer) trx.doneBuyer=true;
      if(msg.author.id===trx.seller) trx.doneSeller=true;
      await db.write();
      if(trx.doneBuyer && trx.doneSeller){
        trx.status='WAITING_PAYOUT_INFO'; await db.write();
        return msg.channel.send(`✅ KEDUA PIHAK DONE!\n\nSeller <@${trx.seller}> ketik metode cair:\n\`DANA 081234567890 A/N Wafa\` atau \`BCA 1234567890 A/N Wafa\``);
      }else return msg.channel.send(`📝 ${msg.author.id===trx.buyer?'Buyer ✅':'Buyer ❌'} | ${msg.author.id===trx.seller?'Seller ✅':'Seller ❌'} Menunggu pihak lain.`);
    }
  }
  if(trx.status==='WAITING_PAYOUT_INFO' && msg.author.id===trx.seller && msg.content.length>5 && msg.content.toLowerCase()!=='done'){
    trx.payoutMethod=msg.content; trx.status='WAITING_SELLER_CONFIRM'; await db.write();
    const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`confirm_payout_${ref}`).setLabel('✅ KONFIRMASI KIRIM DANA').setStyle(ButtonStyle.Success));
    return msg.channel.send({content:`💳 Payout: ${msg.content}\nSeller terima Rp ${trx.amount.toLocaleString('id-ID')}`,components:[row]});
  }
  if(trx.status==='WAITING_REFUND_INFO' && msg.author.id===trx.buyer && msg.content.length>5){
    trx.refundMethod=msg.content; trx.status='REFUNDED'; await db.write();
    const log=new EmbedBuilder().setTitle('🔴 REFUND').setDescription(`Ref:${ref} Refund Rp ${trx.amount} ke ${msg.content}`).setColor(0xFF0000);
    await sendLog(log); await msg.channel.send(`✅ REFUND ke ${msg.content}`); return autoCloseTicket(msg.channel,ref);
  }
});

client.on(Events.InteractionCreate, async(i)=>{
  if(i.customId==='create_ticket'){
    const modal=new ModalBuilder().setCustomId('modal_rekber').setTitle('Buat Ticket Rekber');
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('lawan').setLabel('Username lawan (@tag)').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nominal').setLabel('Jumlah (50000)').setStyle(TextInputStyle.Short).setRequired(true))
    );
    return i.showModal(modal);
  }
  if(i.isModalSubmit() && i.customId==='modal_rekber'){
    await i.deferReply({ephemeral:true});
    const lawanRaw=i.fields.getTextInputValue('lawan'); const nominal=parseInt(i.fields.getTextInputValue('nominal').replace(/[^0-9]/g,''));
    const sellerId=lawanRaw.replace(/[^0-9]/g,''); const seller=await client.users.fetch(sellerId).catch(()=>null);
    if(!seller) return i.editReply('❌ Tag lawan yang bener!');
    const fee=getFee(nominal); const total=nominal+fee; const ref=`WAFA-${Date.now()}`;
    const payment=await createTransaction(total,ref,i.user.username);
    const channel=await i.guild.channels.create({name:`ticket-${nominal/1000}k-${ref.slice(-4)}`,type:ChannelType.GuildText,parent:TICKET_CATEGORY_ID||null,permissionOverwrites:[{id:i.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:i.user.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},{id:seller.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]}]});
    db.data.transactions[ref]={ref,buyer:i.user.id,seller:seller.id,amount:nominal,fee,total,status:'WAITING_PAYMENT',channelId:channel.id,qr_url:payment.qr_url,doneBuyer:false,doneSeller:false}; await db.write();
    const embed=new EmbedBuilder().setTitle(`🔒 TICKET REKBER ${ref}`).setDescription(`Buyer:<@${i.user.id}>\nSeller:<@${seller.id}>\n\nHarga:Rp ${nominal.toLocaleString('id-ID')}\nFee:Rp ${fee.toLocaleString('id-ID')}\nTOTAL:Rp ${total.toLocaleString('id-ID')}\n\nScan QRIS 15 menit.`).setImage(payment.qr_url).setColor(0x00FF00);
    const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`cancel_${ref}`).setLabel('❌ Batalkan').setStyle(ButtonStyle.Danger));
    await channel.send({content:`<@${i.user.id}> <@${seller.id}>`,embeds:[embed],components:[row]}); await i.editReply(`✅ Ticket ${channel}`);
    setTimeout(async()=>{const t=db.data.transactions[ref]; if(t&&t.status==='WAITING_PAYMENT'){t.status='EXPIRED'; await db.write(); channel.send(`❌ Expired`).catch(()=>{}); autoCloseTicket(channel,ref,2*60*1000);}},15*60*1000);
  }
  if(i.isButton()){
    const ref=i.customId.split('_').slice(1).join('_').replace('payout_',''); const trx=db.data.transactions[ref]; if(!trx) return;
    if(i.customId.startsWith('cancel_')){
      if(i.user.id!==trx.buyer) return i.reply({content:'❌ Hanya buyer!',ephemeral:true});
      trx.status='WAITING_REFUND_INFO'; await db.write(); return i.reply(`❌ Dibatalkan\n<@${trx.buyer}> isi metode refund: DANA 0812...`);
    }
    if(i.customId.startsWith('confirm_payout_')){
      if(i.user.id!==trx.seller) return i.reply({content:'❌ Hanya seller!',ephemeral:true});
      trx.status='COMPLETED'; await db.write();
      const log=new EmbedBuilder().setTitle('✅ DONE').setDescription(`Ref:${ref}\nBuyer:<@${trx.buyer}>\nSeller:<@${trx.seller}>\nPayout:${trx.payoutMethod}`).setColor(0x00FF00);
      await sendLog(log); await i.reply(`✅ DANA Rp ${trx.amount.toLocaleString('id-ID')} dikirim ke ${trx.payoutMethod}`); return autoCloseTicket(i.channel,ref);
    }
  }
});

app.post('/webhook/pakasir', async(req,res)=>{
  const {merchant_ref,ref,status}=req.body; const key=merchant_ref||ref; const trx=db.data.transactions[key]; if(!trx) return res.send('OK');
  if((status==='PAID'||status==='paid'||status==='success')&&trx.status==='WAITING_PAYMENT'){
    trx.status='PAID_HELD'; await db.write();
    const ch=await client.channels.fetch(trx.channelId).catch(()=>null);
    if(ch) ch.send(`✅ DANA MASUK Rp ${trx.total.toLocaleString('id-ID')} PAKASIR! Lanjut, ketik done!`);
  }
  res.send('OK');
});

app.listen(process.env.PORT||3000,()=>console.log('Web ON'));
client.login(process.env.BOT_TOKEN);
