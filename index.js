require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const TOKEN = process.env.DISCORD_TOKEN;
const SLUG = process.env.PAKASIR_SLUG || 'wafastoreonly';
const API_KEY = process.env.PAKASIR_API_KEY;
async function getProducts() {
    try {
        const res = await axios.get(`https://pakasir.com/api/public/${SLUG}/products`, { headers: { 'x-api-key': API_KEY } });
        return res.data.data || res.data;
    } catch (e) { return []; }
}
client.on('ready', async () => {
    console.log(`Bot ${client.user.tag} online!`);
    const commands = [
        new SlashCommandBuilder().setName('stok').setDescription('Lihat stok produk WafaStoreOnly'),
        new SlashCommandBuilder().setName('order').setDescription('Cara order di WafaStoreOnly'),
        new SlashCommandBuilder().setName('cek').setDescription('Cek transaksi').addStringOption(o => o.setName('kode').setDescription('Kode transaksi / email').setRequired(true)),
        new SlashCommandBuilder().setName('produk').setDescription('List semua produk dengan harga'),
    ].map(c => c.toJSON());
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'stok' || interaction.commandName === 'produk') {
        await interaction.deferReply();
        const products = await getProducts();
        if (!products.length) return interaction.editReply('❌ Stok kosong / cek API Key PakaSir di Render.');
        const embed = new EmbedBuilder().setTitle('🛒 WafaStoreOnly - Stok').setColor(0x00FF88).setDescription(`Total ${products.length} produk`).setTimestamp();
        products.slice(0, 10).forEach(p => {
            embed.addFields({ name: `${p.name} - Rp${Number(p.price).toLocaleString('id-ID')}`, value: `Stok: ${p.stock||0} | [Beli](https://pakasir.com/${SLUG}/${p.slug||p.id})`, inline: false });
        });
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Buka Toko').setStyle(ButtonStyle.Link).setURL(`https://pakasir.com/${SLUG}`));
        return interaction.editReply({ embeds: [embed], components: [row] });
    }
    if (interaction.commandName === 'order') {
        const embed = new EmbedBuilder().setTitle('📦 Cara Order').setColor(0x5865F2).setDescription(`1. /stok\n2. Klik link beli\n3. Bayar QRIS\n4. Produk dikirim otomatis\n\nToko: https://pakasir.com/${SLUG}`);
        return interaction.reply({ embeds: [embed] });
    }
    if (interaction.commandName === 'cek') {
        return interaction.reply(`Cek di: https://pakasir.com/${SLUG}/check?code=${interaction.options.getString('kode')}`);
    }
});
client.login(TOKEN);
