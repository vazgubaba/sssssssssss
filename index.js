const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = '.';

// Sadece senin kullanabilmen için Discord ID'n
const SAHIP_ID = '827905938923978823';

// Yasaklı kullanıcı ID'lerini hafızada tutacak set
const yasakliKullanicilar = new Set();

client.once('ready', () => {
    console.log(`Bot başarıyla giriş yaptı: ${client.user.tag}`);
});

// 1. KOMUT KONTROLÜ (Mesajları Dinleme)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // .sesyasak komut grubu
    if (command === 'sesyasak') {
        
        // ÖZEL YETKİ KONTROLÜ: Mesajı atan kişi senin ID'ne sahip değilse engelle
        if (message.author.id !== SAHIP_ID) {
            return message.reply('Kaybol buradan!');
        }

        const altKomut = args[0]; // ekle veya kaldir
        const hedefId = args[1];  // Kullanıcı ID'si

        if (!altKomut || !hedefId) {
            return message.reply(`Kullanım şekli:\n\`${PREFIX}sesyasak ekle ID\`\n\`${PREFIX}sesyasak kaldir ID\``);
        }

        if (altKomut === 'ekle') {
            yasakliKullanicilar.add(hedefId);
            message.reply(`<@${hedefId}> (ID: ${hedefId}) başarıyla ses yasaklılar listesine eklendi.`);

            // Eğer kullanıcı şu an bir ses kanalındaysa onu hemen sesten at
            const uye = message.guild.members.cache.get(hedefId);
            if (uye && uye.voice.channelId) {
                try {
                    await uye.voice.disconnect('Ses yasağı uygulandı.');
                    message.channel.send(`<@${hedefId}> zaten bir sesteydi, bağlantısı kesildi.`);
                } catch (err) {
                    console.error('Kullanıcı sesten atılamadı:', err);
                }
            }
        } 
        
        else if (altKomut === 'kaldir') {
            if (yasakliKullanicilar.has(hedefId)) {
                yasakliKullanicilar.delete(hedefId);
                message.reply(`<@${hedefId}> (ID: ${hedefId}) kullanıcısının ses yasağı kaldırıldı.`);
            } else {
                message.reply('Bu kullanıcı zaten yasaklı listesinde değil.');
            }
        } 
        
        else {
            message.reply('Geçersiz işlem. Lütfen `ekle` veya `kaldir` yazın.');
        }
    }
});

// 2. SES KANALI KONTROLÜ (Biri Sese Girdiğinde Tetiklenir)
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!newState.channelId) return; 

    const kullaniciId = newState.id;

    if (yasakliKullanicilar.has(kullaniciId)) {
        try {
            await newState.disconnect('Ses yasaklısı olduğu için atıldı.');
            console.log(`Yasaklı kullanıcı (${kullaniciId}) sesten atıldı.`);
        } catch (error) {
            console.error(`Kullanıcı sesten atılırken hata oluştu:`, error);
        }
    }
});

client.login(process.env.TOKEN);
