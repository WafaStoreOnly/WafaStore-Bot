require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
// Biar Vercel bisa serve index.html web lu
app.use(express.static(__dirname));

const TOKEN = process.env.DISCORD_TOKEN;
const SLUG = process.env.PAKASIR_SLUG || 'wafastoreonly';
const API_KEY = process.env.PAKASIR_API_KEY;

async function getProducts() {
    try {
        const res = await axios.get(`https://pakasir.com/api/public/${SLUG}/products`, { headers: { 'x-api-key': API_KEY } });
        return res.data.data || res.data;
    } catch (e) { console.log('Pakasir Error:', e.message); return []; }
}

// --- API UNTUK WEB LU ---
// Web lu nanti bisa ambil stok asli dari Pakasir biar sinkron
app.get('/api/produk', async (req, res) => {
    const products = await getProducts();
    res.json(products);
});

// Biar kalo buka / tetep keluarin index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- DISCORD BOT LU YANG LAMA (GUA GAK UBAH LOGIC) ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('ready', async () => {
    console.log(`Bot ${client.user.tag} online! Web + Bot Gabung!`);
    const commands = [
        new SlashCommandBuilder().setName('stok').setDescription('Lihat stok produk WafaStoreOnly'),
        new SlashCommandBuilder().setName('order').setDescription('Cara order di WafaStoreOnly'),
        new SlashCommandBuilder().setName('cek').setDescription('Cek transaksi').addStringOption(o => o.setName('kode').setDescription('Kode transaksi / email').setRequired(true)),
        new SlashCommandBuilder().setName('produk').setDescription('List semua produk dengan harga'),
    ].map(c => c.toJSON());
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands registered');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'stok' || interaction.commandName === 'produk') {
        await interaction.deferReply();
        const products = await getProducts();
        if (!products.length) return interaction.editReply('❌ Stok kosong / cek API Key PakaSir di Environment.');
        const embed = new EmbedBuilder().setTitle('🛒 WafaStoreOnly - Stok').setColor(0x00FF88).setDescription(`Total ${products.length} produk | Web: https://wafastoreonly.cloud`).setTimestamp();
        products.slice(0, 10).forEach(p => {
            embed.addFields({ name: `${p.name} - Rp${Number(p.price).toLocaleString('id-ID')}`, value: `Stok: ${p.stock||0} | [Beli di Web](https://wafastoreonly.cloud) atau [Beli di Pakasir](https://pakasir.com/${SLUG}/${p.slug||p.id})`, inline: false });
        });
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Buka Web Toko').setStyle(ButtonStyle.Link).setURL(`https://wafastoreonly.cloud`),
            new ButtonBuilder().setLabel('Buka Pakasir').setStyle(ButtonStyle.Link).setURL(`https://pakasir.com/${SLUG}`)
        );
        return interaction.editReply({ embeds: [embed], components: [row] });
    }
    if (interaction.commandName === 'order') {
        const embed = new EmbedBuilder().setTitle('📦 Cara Order WafaStoreOnly').setColor(0x5865F2).setDescription(`1. Buka https://wafastoreonly.cloud\n2. Pilih nominal (Username 16K / Gamepass 14K / Gift 95/robux)\n3. Bayar via DANA/GoPay 083862776790 atau QRIS\n4. Silahkan ditunggu, Robux masuk 5 menit!\n\nAtau bisa juga via Pakasir: https://pakasir.com/${SLUG}\n\nCek transaksi: /cek KODE`);
        return interaction.reply({ embeds: [embed] });
    }
    if (interaction.commandName === 'cek') {
        return interaction.reply(`Cek transaksi kamu di sini ya kak:\nhttps://pakasir.com/${SLUG}/check?code=${interaction.options.getString('kode')}\n\nJika sudah bayar, **silahkan ditunggu ya**, sistem akan proses otomatis!`);
    }
});

if(TOKEN) client.login(TOKEN);

// --- JALANIN WEB SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web + Bot jalan di port ${PORT}`));

module.exports = app;
