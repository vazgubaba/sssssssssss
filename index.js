// ===================== TEAMCRUZ • LASTREN ASSISTANT (MODERN FULL) =====================
// discord.js v14 | PREFIX (.)
// Ticket(Başvuru Paneli) • Moderasyon • Ses • FiveM • OT Envanter • Log
// ✅ Botun tüm cevapları EMBED
// ✅ Satır formatı: (emoji) ・ yazı
// ✅ Tek görsel noktası: BOT_IMAGE_URL (değiştirince her yerde değişir)
// ✅ Delay Fix / Render Fix / FiveM Timeout Fix / Cache Fix
// ==============================================================================
process.on("unhandledRejection", (r) => console.error("UNHANDLED_REJECTION:", r));
process.on("uncaughtException", (e) => console.error("UNCAUGHT_EXCEPTION:", e));

const fs = require("fs");
const path = require("path");
const express = require("express");

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
  ActivityType
} = require("discord.js");

const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// ===================== FETCH (Node 18+ global) fallback =====================
let _fetch = global.fetch;
if (!_fetch) {
  try {
    _fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
  } catch (e) {
    console.error("❌ fetch yok! Node 18+ kullan veya node-fetch kur.");
    process.exit(1);
  }
}

// ===================== ENV / TOKEN =====================
const TOKEN = (
  process.env.DISCORD_BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  process.env.TOKEN ||
  ""
).trim();

if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN eksik! (Render ENV'e ekle)");
  process.exit(1);
}

// ===================== Render Keep-Alive =====================
const app = express();
app.get("/", (req, res) => res.status(200).send("OK"));
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log("🌐 Web aktif:", PORT));

// ===================== AYARLAR =====================
const PREFIX = ".";
const OWNER_IDS = ["827905938923978823", "1129811807570247761"];

const isOwner = (id) => OWNER_IDS.includes(id);


// Görsel TEK NOKTA: bunu değiştirince her embed/panel resmi değişsin
const BOT_IMAGE_URL =
  (process.env.BOT_IMAGE_URL || process.env.BOT_IMAGE || "").trim() ||
  "https://media.discordapp.net/attachments/1464697274692010137/1471608248544137407/giphy.gif?ex=698f8d7b&is=698e3bfb&hm=498dd45fbafc43408085520ec28979db587085cf2b10d13c798167101541210e&=";

const THUMB_URL = (process.env.THUMB_URL || BOT_IMAGE_URL).trim();
const PANEL_IMAGE = (process.env.PANEL_IMAGE || BOT_IMAGE_URL).trim();

// Başlık/Author yazısı
const PANEL_AUTHOR = (process.env.PANEL_AUTHOR || "vazgucxn Assistant").trim();
const FOOTER_TEXT = (process.env.FOOTER_TEXT || "Woopiè • Assistant").trim();

// Ticket panelinde görünecek sunucu adı (örn: "SHADON #V9")
const SERVER_NAME = (process.env.SERVER_NAME || "SUNUCU ADI").trim();

// FiveM CFX (senin verdiğin)
const CFX_CODE = (process.env.CFX_CODE || "xjx5kr").trim();

// Tema renk
const NAVY = 0x0b1a3a;

// ===================== EMOJİLER (SENİN ÖZEL SET) =====================
const EMOJI = {
  settings: "<a:Settings:1462101523533398046>",
  success: "<a:onay:1462114135453208863>",
  info: "<:info:1462113831622021151>",
  lock: "<a:lock_key:1457137947621982403>",
  right: "<a:sagok:1462379309942440019>",
  star: "<a:yildiz:1462380028594749450>",
  warn: "<:uyari1:1462381127330168999>",

  ban: "<a:ban:1462382043689127986>",
  kick: "<:Personkick:1462382349772656837>",
  trash: "<:Trash:1462382687615713362>",
  shield: "<:Blue:1462382912635666492>",

  weed: "<:weed:1462383134887903284>",
  box: "<:emojigg_box:1462383526233247838>",
  crown: "<:BlueCrown:1462383781724946493>",
  refresh: "<:Refresh:1462384050537889944>",

  headphones: "<:Spotify_Headphones:1462384349336043562>",
  muted: "<:muted:1462384527556219091>",
  unmute: "<:unmute:1462384694636056577>",
  move: "<a:sagok:1462379309942440019>",

  search: "<:Search:1462385030985941056>",
  fivem: "<:FiveM:1457139814192251064>"
};

// ===================== YETKİ =====================
const STAFF_IDS = new Set(
  (process.env.STAFF_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
);

// İstersen burayı sabit bırakabilirsin (senin attığın liste)
if (STAFF_IDS.size === 0) {
  [
    "1129811807570247761",
    "1395918752159236321",
    "689416586905649189",
    "1073527389545570315"
  ].forEach((id) => STAFF_IDS.add(id));
}

const isStaff = (id) => isOwner(id) || STAFF_IDS.has(id);

// ===================== DATA / CONFIG =====================
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const INV_FILE = path.join(DATA_DIR, "envanter.json");
const AUTH_FILE = path.join(DATA_DIR, "otyetki.json");
const OTLOG_FILE = path.join(DATA_DIR, "otlog.json");

function loadJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}
function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch {}
}

const config = loadJSON(CONFIG_FILE, {
  logChannelId: null,
  ticketCategoryId: null,
  ticketStaffRoleId: null
});

let logChannelId = config.logChannelId;
let ticketCategoryId = config.ticketCategoryId;
let ticketStaffRoleId = config.ticketStaffRoleId;

let envanter = loadJSON(INV_FILE, {});
let otYetkililer = loadJSON(AUTH_FILE, []);
let otLogChannelId = loadJSON(OTLOG_FILE, null);

// ===================== HELPERS =====================
const formatNumber = (n) => Number(n || 0).toLocaleString("tr-TR");
const line = (emoji, text) => `${emoji} ・ ${text}`;

function baseEmbed(guild) {
  const authorIcon = guild?.iconURL?.({ size: 128 }) || undefined;
  return new EmbedBuilder()
    .setColor(NAVY)
    .setThumbnail(THUMB_URL)
    .setAuthor({ name: PANEL_AUTHOR, iconURL: authorIcon })
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}
function createEmbed(guild, { title, description, fields, image }) {
  const e = baseEmbed(guild);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(fields);
  if (image) e.setImage(image);
  return e;
}
async function replyE(message, embed) {
  return message.reply({ embeds: [embed] }).catch(() => {});
}
async function sendE(channel, embed, components) {
  return channel.send({ embeds: [embed], components: components || [] }).catch(() => {});
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await _fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}



  
async function sendLog(guild, embed) {
  if (!logChannelId) return;
  const ch = guild.channels.cache.get(logChannelId);
  if (ch) ch.send({ embeds: [embed] }).catch(() => {});
}
async function sendOtLog(guild, embed) {
  if (!otLogChannelId) return;
  const ch = guild.channels.cache.get(otLogChannelId);
  if (ch) ch.send({ embeds: [embed] }).catch(() => {});
}

// ===================== FiveM Cache (LAG FIX) =====================
let lastPlayersFetchAt = 0;
let cachedPlayersJson = null;

function cleanFiveMName(name = "") {
  return String(name).replace(/\^\d/g, "").toLowerCase();
}
async function getServerPlayersCached() {
  const now = Date.now();

  if (cachedPlayersJson && now - lastPlayersFetchAt < 30000) {
    return cachedPlayersJson;
  }

  const url = `https://servers-frontend.fivem.net/api/servers/single/${CFX_CODE}`;

  const res = await fetchWithTimeout(url, {}, 5000);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();

  cachedPlayersJson = json;
  lastPlayersFetchAt = now;

  return json;
}


async function getPlayerFromCFX(playerId) {
  const json = await getServerPlayersCached();
  const players = json?.Data?.players || [];
  const p = players.find((x) => String(x.id) === String(playerId));
  if (!p) return { found: false };

  const ids = Array.isArray(p.identifiers) ? p.identifiers : [];
  return {
    found: true,
    id: p.id,
    name: p.name,
    ping: p.ping,
    steam: ids.find((i) => i.startsWith("steam:")) || "Yok",
    discord: ids.find((i) => i.startsWith("discord:"))?.replace("discord:", "") || "Yok"
  };
}

// ===================== OT helpers =====================
function isOtYetkili(id) {
  return otYetkililer.includes(id);
}
function ensureUser(id) {
  if (!envanter[id]) envanter[id] = { ot: 0 };
  if (typeof envanter[id].ot !== "number") envanter[id].ot = 0;
}
// ===================== WHITELIST =====================
const whitelist = new Set();
// ===================== FORCE BAN =====================
const forceBans = new Set();


// Guardı kullanabilecek ana yetkililer
const GUARD_OWNERS = [
  "827905938923978823",
  "1129811807570247761"
];

// ===================== CLIENT =====================
const urlProtection = {
  enabled: false,
};
const guardSystem = {
  roleProtection: true,
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ===================== STATE =====================
const aktiflikList = new Map(); // messageId => Set(userId)
let maintenanceMode = false;
const ticketOwners = new Map();      // channelId -> openerId
const etkinlikList = new Map(); 
const voiceBlockedUsers = new Set(); // ses yasak list
// ===================== GUARD SYSTEM (SIFIRDAN) =====================

// Guard ayar dosyası
const GUARD_FILE = path.join(DATA_DIR, "guard.json");

// Default ayarlar (istersen değiştirirsin)
const guardConfig = loadJSON(GUARD_FILE, {
  enabled: true,

  // Sistemler tek tek aç/kapat
  systems: {
    ban: true,
    kick: true,
    channel: true,
    role: true
  },

  // Limitler (0 = sınırsız / kapalı gibi düşünme, limit kontrol etmez)
  limits: {
    ban: 2,
    kick: 3,
    channel: 1,
    role: 2
  },

  // Sayaç reset süresi (dakika)
  windowMinutes: 10
});

function saveGuard() {
  saveJSON(GUARD_FILE, guardConfig);
}

// Sadece owner muaf (başka kimse değil)
function isGuardOwner(id) {
  return isOwner(id); // OWNER_IDS içinde olanlar
}

// Sayac state: guildId => { userId => {ban,kick,channel,role, lastReset} }
const guardCounters = new Map();

function getCounterBucket(guildId) {
  if (!guardCounters.has(guildId)) guardCounters.set(guildId, new Map());
  return guardCounters.get(guildId);
}

function ensureUserCounter(guildId, userId) {
  const bucket = getCounterBucket(guildId);
  if (!bucket.has(userId)) {
    bucket.set(userId, {
      ban: 0,
      kick: 0,
      channel: 0,
      role: 0,
      lastReset: Date.now()
    });
  }
  return bucket.get(userId);
}

function maybeResetWindow(counter) {
  const windowMs = Math.max(1, Number(guardConfig.windowMinutes || 10)) * 60 * 1000;
  if (Date.now() - counter.lastReset >= windowMs) {
    counter.ban = 0;
    counter.kick = 0;
    counter.channel = 0;
    counter.role = 0;
    counter.lastReset = Date.now();
  }
}

function isGuardEnabled(systemKey) {
  if (!guardConfig.enabled) return false;
  if (!guardConfig.systems?.[systemKey]) return false;
  return true;
}

function getLimit(key) {
  const n = Number(guardConfig.limits?.[key] ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

// Embed helper: fontlu/modern görünüm için (kalın + küçük harf + satır formatı)
function guardPanelEmbed(guild) {
  const on = `${EMOJI.success} ・ **AÇIK**`;
  const off = `${EMOJI.warn} ・ **KAPALI**`;

  const banS = isGuardEnabled("ban") ? on : off;
  const kickS = isGuardEnabled("kick") ? on : off;
  const chS = isGuardEnabled("channel") ? on : off;
  const roleS = isGuardEnabled("role") ? on : off;

  const banL = getLimit("ban");
  const kickL = getLimit("kick");
  const chL = getLimit("channel");
  const roleL = getLimit("role");

  const win = Math.max(1, Number(guardConfig.windowMinutes || 10));

  return createEmbed(guild, {
    title: `${EMOJI.shield} ・ ɢᴜᴀʀᴅ ᴘᴀɴᴇʟ`,
    description:
      `${EMOJI.settings} ・ **Sistem Durumu**\n` +
      `${EMOJI.ban} ・ Ban Guard: ${banS}\n` +
      `${EMOJI.kick} ・ Kick Guard: ${kickS}\n` +
      `${EMOJI.trash} ・ Kanal Guard: ${chS}\n` +
      `${EMOJI.crown} ・ Rol Guard: ${roleS}\n\n` +
      `${EMOJI.info} ・ **Limitler (/${win} dk)**\n` +
      `${EMOJI.ban} ・ Ban Limit: **${banL}**\n` +
      `${EMOJI.kick} ・ Kick Limit: **${kickL}**\n` +
      `${EMOJI.trash} ・ Kanal Silme Limit: **${chL}**\n` +
      `${EMOJI.crown} ・ Rol Silme Limit: **${roleL}**\n\n` +
      `${EMOJI.right} ・ Komutlar: \`${PREFIX}banlimit\` \`${PREFIX}kicklimit\` \`${PREFIX}kanallimit\` \`${PREFIX}rollimit\` \`${PREFIX}guardpanel\``,
    image: BOT_IMAGE_URL
  });
}

// ===================== Presence =====================
function setBotPresence() {
  if (!client.user) return;
  client.user.setPresence({
    activities: [{ name: "VAZGUCXN WAS HERE ", type: ActivityType.Playing }],
    status: "dnd"
  });
}

// ===================== READY =====================
client.once("ready", () => {
  console.log(`🟢 Bot aktif: ${client.user.tag}`);
  setBotPresence();
  setInterval(setBotPresence, 5 * 60 * 1000);
});

// BOT ALIVE (Render uyutma fix)
setInterval(() => {
  console.log("🟢 BOT ALIVE:", new Date().toISOString());
}, 60_000);

// ===================== LOG EVENTS =====================

// Ban Log
client.on("guildBanAdd", async (ban) => {
  const ch = ban.guild.channels.cache.get(config.logs?.banLog);
  if (!ch) return;

  const embed = createEmbed(ban.guild, {
    title: `${EMOJI.ban} ・ ʙᴀɴ ʟᴏɢ`,
    description:
      `${EMOJI.info} ・ Kullanıcı: ${ban.user}\n` +
      `${EMOJI.right} ・ ID: ${ban.user.id}`
  });

  ch.send({ embeds: [embed] }).catch(() => {});
});


// Kick Log
client.on("guildMemberRemove", async (member) => {

  const logs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: 20
  }).catch(() => null);

  if (!logs) return;

  const entry = logs.entries.first();
  if (!entry) return;

  if (entry.action !== 20) return;

  const ch = member.guild.channels.cache.get(config.logs?.kickLog);
  if (!ch) return;

  const embed = createEmbed(member.guild, {
    title: `${EMOJI.kick} ・ ᴋɪᴄᴋ ʟᴏɢ`,
    description:
      `${EMOJI.info} ・ Atılan: ${member.user}\n` +
      `${EMOJI.right} ・ Yetkili: ${entry.executor}`
  });

  ch.send({ embeds: [embed] }).catch(() => {});
});


// Mesaj Silme Log
client.on("messageDelete", async (msg) => {

  if (!msg.guild || msg.author?.bot) return;

  const ch = msg.guild.channels.cache.get(config.logs?.msgLog);
  if (!ch) return;

  const embed = createEmbed(msg.guild, {
    title: `${EMOJI.trash} ・ ᴍᴇꜱᴀᴊ ꜱɪʟɪɴᴅɪ`,
    description:
      `${EMOJI.info} ・ Kullanıcı: ${msg.author}\n` +
      `${EMOJI.right} ・ Kanal: ${msg.channel}\n\n` +
      `💬 **Mesaj:**\n${msg.content || "Boş"}`
  });

  ch.send({ embeds: [embed] }).catch(() => {});
});


// Rol Log
client.on("guildMemberUpdate", async (oldM, newM) => {

  const ch = newM.guild.channels.cache.get(config.logs?.roleLog);
  if (!ch) return;

  const oldRoles = oldM.roles.cache.map(r => r.id);
  const newRoles = newM.roles.cache.map(r => r.id);

  if (oldRoles.length === newRoles.length) return;

  const added = newRoles.filter(r => !oldRoles.includes(r));
  const removed = oldRoles.filter(r => !newRoles.includes(r));

  let text = "";

  if (added.length)
    text += `➕ Eklenen: <@&${added.join(">, <@&")}>\n`;

  if (removed.length)
    text += `➖ Alınan: <@&${removed.join(">, <@&")}>\n`;

  const embed = createEmbed(newM.guild, {
    title: `${EMOJI.crown} ・ ʀᴏʟ ʟᴏɢ`,
    description:
      `${EMOJI.info} ・ Üye: ${newM}\n\n${text}`
  });

  ch.send({ embeds: [embed] }).catch(() => {});
});


// Kanal Log
client.on("channelDelete", async (channel) => {

  const ch = channel.guild.channels.cache.get(config.logs?.channelLog);
  if (!ch) return;

  const embed = createEmbed(channel.guild, {
    title: `${EMOJI.warn} ・ ᴋᴀɴᴀʟ ꜱɪʟɪɴᴅɪ`,
    description:
      `${EMOJI.info} ・ İsim: ${channel.name}\n` +
      `${EMOJI.right} ・ ID: ${channel.id}`
  });

  ch.send({ embeds: [embed] }).catch(() => {});
});


// Ses Log
client.on("voiceStateUpdate", (oldS, newS) => {

  const ch = newS.guild.channels.cache.get(config.logs?.voiceLog);
  if (!ch) return;

  if (!oldS.channelId && newS.channelId) {

    ch.send({
      embeds: [
        createEmbed(newS.guild, {
          title: `${EMOJI.headphones} ・ ꜱᴇꜱ ɢɪʀɪꜱ`,
          description: `${EMOJI.info} ・ ${newS.member} → ${newS.channel}`
        })
      ]
    });

  } else if (oldS.channelId && !newS.channelId) {

    ch.send({
      embeds: [
        createEmbed(newS.guild, {
          title: `${EMOJI.muted} ・ ꜱᴇꜱ ᴄɪᴋɪꜱ`,
          description: `${EMOJI.info} ・ ${newS.member}`
        })
      ]
    });

  }
});


// Bot Log
client.on("guildMemberAdd", (m) => {

  if (!m.user.bot) return;

  const ch = m.guild.channels.cache.get(config.logs?.botLog);
  if (!ch) return;

  const embed = createEmbed(m.guild, {
    title: `${EMOJI.settings} ・ ʙᴏᴛ ᴇᴋʟᴇɴᴅɪ`,
    description: `${EMOJI.info} ・ ${m.user}`
  });

  ch.send({ embeds: [embed] });
});


// ===================== GUARD EVENTS =====================

async function fetchExecutor(guild, type) {
  try {
    const logs = await guild.fetchAuditLogs({ limit: 1, type });
    const entry = logs.entries.first();
    if (!entry) return null;
    return entry;
  } catch {
    return null;
  }
}

async function punishMember(guild, userId, reason) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return false;

    // Owner muaf
    if (isGuardOwner(member.id)) return false;

    // Kick atmayı dene (ban değil, çünkü anti-ban sisteminde yanlışlık riskini düşürüyoruz)
    await member.kick(reason).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function guardHit(guild, executorId, key, reasonText) {
  if (!guild || !executorId) return;

  // Owner muaf
  if (isGuardOwner(executorId)) return;

  const limit = getLimit(key);
  if (limit === 0) return; // sınırsızsa dokunma

  const counter = ensureUserCounter(guild.id, executorId);
  maybeResetWindow(counter);

  counter[key] = (counter[key] || 0) + 1;

  // Log embed
  const hitEmbed = createEmbed(guild, {
    title: `${EMOJI.warn} ・ ɢᴜᴀʀᴅ ᴀʟᴀʀᴍ`,
    description:
      `${EMOJI.info} ・ İşlem: **${key.toUpperCase()}**\n` +
      `${EMOJI.right} ・ Yapan: <@${executorId}>\n` +
      `${EMOJI.settings} ・ Sayaç: **${counter[key]}/${limit}**\n` +
      `${EMOJI.warn} ・ Sebep: **${reasonText}**`,
    image: BOT_IMAGE_URL
  });

  // Eğer log kanalın varsa oraya da yollar (sendLog sende var)
  await sendLog(guild, hitEmbed);

  if (counter[key] >= limit) {
    const punished = await punishMember(guild, executorId, `GUARD: ${reasonText} (limit aşıldı)`).catch(() => false);

    const endEmbed = createEmbed(guild, {
      title: `${EMOJI.lock} ・ ɢᴜᴀʀᴅ ᴍᴜᴅᴀʜᴀʟᴇ`,
      description:
        `${EMOJI.success} ・ Limit aşıldı, işlem uygulandı.\n` +
        `${EMOJI.right} ・ Yapan: <@${executorId}>\n` +
        `${EMOJI.settings} ・ Sistem: **${key.toUpperCase()}**\n` +
        `${EMOJI.info} ・ Sonuç: **${punished ? "Kick denendi" : "Üye bulunamadı / yetki yok"}**`,
      image: BOT_IMAGE_URL
    });

    await sendLog(guild, endEmbed);
  }
}

// Anti Ban
client.on("guildBanAdd", async (ban) => {
  try {
    const guild = ban.guild;
    if (!isGuardEnabled("ban")) return;

    const entry = await fetchExecutor(guild, 22 /* AuditLogEvent.MemberBanAdd */);
    if (!entry) return;

    const executorId = entry.executor?.id;
    if (!executorId) return;

    // hedef bu ban mı? (audit bazen karışabilir)
    const targetId = entry.target?.id;
    if (targetId && String(targetId) !== String(ban.user.id)) return;

    await guardHit(guild, executorId, "ban", `Üye banlandı: ${ban.user.tag}`);
  } catch {}
});

// Anti Kick (audit ile)
client.on("guildMemberRemove", async (member) => {
  try {
    const guild = member.guild;
    if (!isGuardEnabled("kick")) return;

    const entry = await fetchExecutor(guild, 20 /* AuditLogEvent.MemberKick */);
    if (!entry) return;

    const executorId = entry.executor?.id;
    if (!executorId) return;

    const targetId = entry.target?.id;
    if (targetId && String(targetId) !== String(member.id)) return;

    // Eğer "leave" ise audit entry olmayabilir, bu yüzden entry varsa kick sayıyoruz
    await guardHit(guild, executorId, "kick", `Üye kicklendi: ${member.user.tag}`);
  } catch {}
});

// Anti Channel Delete
client.on("channelDelete", async (channel) => {
  try {
    const guild = channel.guild;
    if (!guild) return;
    if (!isGuardEnabled("channel")) return;

    const entry = await fetchExecutor(guild, 12 /* AuditLogEvent.ChannelDelete */);
    if (!entry) return;

    const executorId = entry.executor?.id;
    if (!executorId) return;

    const targetId = entry.target?.id;
    if (targetId && String(targetId) !== String(channel.id)) return;

    await guardHit(guild, executorId, "channel", `Kanal silindi: #${channel.name}`);
  } catch {}
});

// Anti Role Delete
client.on("roleDelete", async (role) => {
  try {
    const guild = role.guild;
    if (!guild) return;
    if (!isGuardEnabled("role")) return;

    const entry = await fetchExecutor(guild, 32 /* AuditLogEvent.RoleDelete */);
    if (!entry) return;

    const executorId = entry.executor?.id;
    if (!executorId) return;

    const targetId = entry.target?.id;
    if (targetId && String(targetId) !== String(role.id)) return;

    await guardHit(guild, executorId, "role", `Rol silindi: ${role.name}`);
  } catch {}
});

// ===================== VOICE BLOCK EVENT =====================
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    const member = newState.member;
    if (!member || member.user.bot) return;
    if (!newState.channelId) return;
    if (voiceBlockedUsers.has(member.id)) {
      await member.voice.disconnect().catch(() => {});
    }
  } catch {}
});

// ===================== TICKET BUTTONS =====================
client.on("interactionCreate", async (i) => {
  try {
    if (!i.isButton()) return;
    if (!i.guild) return;

    const guild = i.guild;

    // ===================== TICKET OPEN =====================
if (i.customId === "ticket_open") {
  await i.deferReply({ flags: 64 });

  if (!ticketCategoryId || !ticketStaffRoleId) {
    return i.editReply("Ticket sistemi ayarlı değil.");
  }

  const category = guild.channels.cache.get(ticketCategoryId);
  if (!category) return i.editReply("Ticket kategorisi geçersiz.");

  const safe = (i.user.username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);

  const name = `basvuru-${safe}`;

  const existing = guild.channels.cache.find(
    c => c.parentId === category.id && c.name === name
  );
  if (existing) return i.editReply(`Zaten açık ticketin var: ${existing}`);

  const ch = await guild.channels.create({
    name,
    parent: category.id,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: ticketStaffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ]
  });

  ticketOwners.set(ch.id, i.user.id);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("ᴋᴀᴘᴀᴛ")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔒")
  );

  // --- FORM METNİ BURADA BAŞLIYOR ---
  const basvuruFormu = `> **_Günde kaç saat aktif olabilirsin?:_**
> **_Kaç yaşındasın?:_**
> **_Oynadığın ekipler:_**
> **_FiveM'de kaç saatin var?:_**
> **_Gelişmiş map bilgin var mı?:_**
> **_Referansın var mı?:_**
> **_En az 5/10 adet kill POV (zorunlu):_**
> **_MDRP Banlı mısın?:_**`;

  await ch.send({
    content: `<@${i.user.id}> | <@&${ticketStaffRoleId}>`,
    embeds: [
      {
        title: "Woopiè Başvuru",
        description: `Aşağıdaki butona tıklayarak başvuru oluşturabilirsiniz.\n\n${basvuruFormu}`,
        color: 0x2f3136, // Koyu gri/siyah tonu (şık durur)
        footer: { text: "Woopiè" }
      }
    ],
    components: [row]
  });
  // --- FORM METNİ BURADA BİTİYOR ---

  return i.editReply(`✅ Ticket açıldı: ${ch}`);
}

    // ===================== TICKET CLOSE =====================
    if (i.customId === "ticket_close") {
      await i.deferReply({ flags: 64 });

      const opener = ticketOwners.get(i.channel.id);
      const admin = i.member.permissions.has(PermissionsBitField.Flags.Administrator);

      if (i.user.id !== opener && !admin)
        return i.editReply("Yetkin yok.");

      await i.channel.delete().catch(() => {});
      ticketOwners.delete(i.channel.id);
      return;
    }

    // ===================== AKTIFLIK =====================
    if (i.customId.startsWith("aktiflik_join_")) {
      const msgId = i.customId.replace("aktiflik_join_", "");

      if (!aktiflikList.has(msgId))
        aktiflikList.set(msgId, new Set());

      const users = aktiflikList.get(msgId);
      if (users.has(i.user.id))
        return i.reply({ content: "❌ Zaten katıldın.", flags: 64 });

      users.add(i.user.id);

      await i.message.edit({ embeds: [/* embed */] });
      return i.reply({ content: "✅ Katıldın!", flags: 64 });
    }

    // ===================== ETKINLIK =====================
    if (i.customId.startsWith("etkinlik_join_")) {
      // etkinlik kodların (burada sorun yok)
        await i.deferReply({ flags: 64 });

  const msgId = i.customId.replace("etkinlik_join_", "");

  const data = etkinlikList.get(msgId);

  if (!data) {
    return i.editReply("❌ Bu etkinlik artık aktif değil.");
  }

  if (data.closed) {
    return i.editReply("🔒 Alımlar kapanmıştır.");
  }

  if (data.users.includes(i.user.id)) {
    return i.editReply("⚠️ Zaten katıldın.");
  }

  if (data.users.length >= data.limit) {
    data.closed = true;
    return i.editReply("🔒 Kontenjan doldu.");
  }

  data.users.push(i.user.id);

  const channel = i.channel;
  const msg = await channel.messages.fetch(msgId);

  let list = data.users
    .map((id, i) => `**${i + 1}.** <@${id}>`)
    .join("\n");

  const embed = createEmbed(i.guild, {
    title: `${EMOJI.star} ・ ${data.title}`,
    description:
      `${EMOJI.success} ・ Katılım alındı\n\n` +
      `👥 **Katılanlar (${data.users.length}/${data.limit})**\n` +
      list,
    image: BOT_IMAGE_URL
  });

  // Dolduysa kapat
  if (data.users.length >= data.limit) {
    data.closed = true;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("closed")
        .setLabel("KAPALI")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔒")
    );

    await msg.edit({
      embeds: [embed],
      components: [row]
    });

    await channel.send({
      embeds: [
        createEmbed(i.guild, {
          title: `${EMOJI.lock} ・ ᴀʟɪᴍʟᴀʀ ᴋᴀᴘᴀɴᴅɪ`,
          description: `${EMOJI.info} ・ **${data.title}** etkinliği dolmuştur.`
        })
      ]
    });

    return i.editReply("✅ Son kontenjan alındı!");
  }

  await msg.edit({
    embeds: [embed]
  });

  return i.editReply("✅ Katılım alındı.");
    }

  } catch (err) {
    console.error("interactionCreate error:", err);
  }
});

// ===================== PREFIX COMMANDS =====================
client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const guild = message.guild;
    const userId = message.author.id;

    // hız hissi
    message.channel.sendTyping().catch(() => {});

    const raw = message.content.slice(PREFIX.length).trim();
    if (!raw) return;

    const args = raw.split(/\s+/);
    const cmd = (args.shift() || "").toLowerCase();

// ===================== GUARD COMMANDS (OWNER ONLY) =====================

if (cmd === "guardpanel") {
  if (!isGuardOwner(userId)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
      description: `${EMOJI.warn} ・ Sadece owner kullanabilir.`
    }));
  }
  return replyE(message, guardPanelEmbed(guild));
}

if (cmd === "banlimit") {
  if (!isGuardOwner(userId)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
      description: `${EMOJI.warn} ・ Sadece owner kullanabilir.`
    }));
  }

  const n = parseInt(args[0], 10);
  if (Number.isNaN(n) || n < 0) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ ᴋᴜʟʟᴀɴɪᴍ`,
      description: `${EMOJI.right} ・ \`${PREFIX}banlimit 2\` (0 = sınırsız)`
    }));
  }

  guardConfig.limits.ban = n;
  saveGuard();

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ ʙᴀɴ ʟɪᴍɪᴛ ᴀʏᴀʀʟᴀɴᴅɪ`,
    description: `${EMOJI.ban} ・ Yeni limit: **${n}**`
  }));
}

if (cmd === "kicklimit") {
  if (!isGuardOwner(userId)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
      description: `${EMOJI.warn} ・ Sadece owner kullanabilir.`
    }));
  }

  const n = parseInt(args[0], 10);
  if (Number.isNaN(n) || n < 0) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ ᴋᴜʟʟᴀɴɪᴍ`,
      description: `${EMOJI.right} ・ \`${PREFIX}kicklimit 3\` (0 = sınırsız)`
    }));
  }

  guardConfig.limits.kick = n;
  saveGuard();

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ ᴋɪᴄᴋ ʟɪᴍɪᴛ ᴀʏᴀʀʟᴀɴᴅɪ`,
    description: `${EMOJI.kick} ・ Yeni limit: **${n}**`
  }));
}

if (cmd === "kanallimit") {
  if (!isGuardOwner(userId)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
      description: `${EMOJI.warn} ・ Sadece owner kullanabilir.`
    }));
  }

  const n = parseInt(args[0], 10);
  if (Number.isNaN(n) || n < 0) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ ᴋᴜʟʟᴀɴɪᴍ`,
      description: `${EMOJI.right} ・ \`${PREFIX}kanallimit 1\` (0 = sınırsız)`
    }));
  }

  guardConfig.limits.channel = n;
  saveGuard();

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ ᴋᴀɴᴀʟ ʟɪᴍɪᴛ ᴀʏᴀʀʟᴀɴᴅɪ`,
    description: `${EMOJI.trash} ・ Yeni limit: **${n}**`
  }));
}

if (cmd === "rollimit") {
  if (!isGuardOwner(userId)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
      description: `${EMOJI.warn} ・ Sadece owner kullanabilir.`
    }));
  }

  const n = parseInt(args[0], 10);
  if (Number.isNaN(n) || n < 0) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ ᴋᴜʟʟᴀɴɪᴍ`,
      description: `${EMOJI.right} ・ \`${PREFIX}rollimit 2\` (0 = sınırsız)`
    }));
  }

  guardConfig.limits.role = n;
  saveGuard();

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ ʀᴏʟ ʟɪᴍɪᴛ ᴀʏᴀʀʟᴀɴᴅɪ`,
    description: `${EMOJI.crown} ・ Yeni limit: **${n}**`
  }));
}

    
    // bakım modu
    if (maintenanceMode && cmd !== "yardim" && cmd !== "bakim") {
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.warn, "ʙᴀᴋɪᴍ ᴍᴏᴅᴜ"),
          description: line(EMOJI.settings, "ʙᴏᴛ ꜱᴜ ᴀɴ ʙᴀᴋɪᴍᴅᴀ")
        })
      );
    }

    // yetki kontrol
    const PUBLIC = new Set([
      "yardim", "help",
      "ping", "test",
      "envanter", "envanterler",
      "top10ot",
      "tag", "id"
    ]);

    const OWNER_CMDS = new Set([
      "bakim",
      "logkur",
      "ticketkategori",
      "basvurupanel",
      "otyetki",
      "otreset",
      "otlogkur"
    ]);

    if (!PUBLIC.has(cmd)) {
      if (OWNER_CMDS.has(cmd)) {
        if (!isOwner(userId)) {
          return replyE(
            message,
            createEmbed(guild, {
              title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
              description: line(EMOJI.warn, "ꜱᴀᴅᴇᴄᴇ ᴏᴡɴᴇʀ")
            })
          );
        }
      } else {
        if (!isStaff(userId)) {
          return replyE(
            message,
            createEmbed(guild, {
              title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
              description: line(EMOJI.warn, "ʏᴇᴛᴋɪʟɪ ᴏʟᴍᴀʟɪꜱɪɴ")
            })
          );
        }
      }
    }
if (cmd === "whitelist" && args[0] === "ekle") {
  if (!GUARD_OWNERS.includes(message.author.id)) return;

  const member = message.mentions.users.first();
  if (!member) return message.reply("Bir kullanıcı etiketle.");

  whitelist.add(member.id);

  return message.reply(`✅ ${member.tag} whitelist'e eklendi.`);
}
if (cmd === "whitelist" && args[0] === "kaldır") {
  if (!GUARD_OWNERS.includes(message.author.id)) return;

  const member = message.mentions.users.first();
  if (!member) return message.reply("Bir kullanıcı etiketle.");

  whitelist.delete(member.id);

  return message.reply(`🗑️ ${member.tag} whitelist'ten çıkarıldı.`);
}

    // ===================== PING =====================
    if (cmd === "ping") {
      const ws = client.ws.ping;
      const start = Date.now();

      const msg = await message.reply({
        embeds: [createEmbed(guild, { title: `${EMOJI.settings} ・ ᴘɪɴɢ`, description: `${EMOJI.info} ・ Ölçülüyor...` })]
      }).catch(() => null);

      const ms = Date.now() - start;
      if (!msg) return;

      return msg.edit({
        embeds: [
          createEmbed(guild, {
            title: `${EMOJI.settings} ・ ᴘɪɴɢ`,
            description: `${EMOJI.success} ・ Mesaj: **${ms}ms**\n${EMOJI.right} ・ WS: **${ws}ms**`
          })
        ]
      }).catch(() => {});
    }

    

    
// ===================== AKTIFLIK =====================
if (cmd === "aktiflik") {

  if (!isStaff(userId)) {
    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
        description: line(EMOJI.warn, "Sadece yetkililer.")
      })
    );
  }

  const embed = createEmbed(guild, {
    title: `${EMOJI.star} ・ ᴀᴋᴛɪꜰʟɪᴋ ᴋᴀᴛɪʟɪᴍ`,
    description:
      `${EMOJI.settings} ・ Aşağıdaki butona basarak aktiflik al.\n\n` +
      `${EMOJI.sagok} ・ **Katılanlar (0)**`,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("temp")
      .setLabel("Katıldım")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅")
  );

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  row.components[0].setCustomId(`aktiflik_join_${msg.id}`);

  await msg.edit({
    components: [row]
  });
}

    // ===================== TEST =====================
    if (cmd === "test") {
      return replyE(
        message,
        createEmbed(guild, {
          title: `${EMOJI.success} ・ ᴛᴇꜱᴛ`,
          description: `${EMOJI.right} ・ Bot aktif ve komutlar çalışıyor ✅`
        })
      );
    }
    // ===================== LOG SETUP =====================
if (cmd === "setup") {

  if (!isOwner(userId)) {
    return replyE(
      message,
      createEmbed(guild, {
        title: `${EMOJI.lock} ・ ʏᴇᴛᴋɪ ʏᴏᴋ`,
        description: `${EMOJI.warn} ・ Sadece bot sahipleri kullanabilir.`
      })
    );
  }

  await message.reply("⚙️ Log sistemi kuruluyor...");

  // Kategori
  const category = await guild.channels.create({
    name: "📂・ᴍᴏᴅᴇʀᴀsʏᴏɴ-ʟᴏɢs",
    type: ChannelType.GuildCategory
  });

  const logs = [
    { name: "🔨・ban-log", key: "banLog" },
    { name: "👢・kick-log", key: "kickLog" },
    { name: "🗑️・mesaj-log", key: "msgLog" },
    { name: "📛・rol-log", key: "roleLog" },
    { name: "📁・kanal-log", key: "channelLog" },
    { name: "🎟️・ticket-log", key: "ticketLog" },
    { name: "🔊・ses-log", key: "voiceLog" },
    { name: "⚙️・bot-log", key: "botLog" }
  ];

  if (!config.logs) config.logs = {};

  for (const log of logs) {
    const ch = await guild.channels.create({
      name: log.name,
      type: ChannelType.GuildText,
      parent: category.id
    });

    config.logs[log.key] = ch.id;
  }

  saveJSON(CONFIG_FILE, config);

  return replyE(
    message,
    createEmbed(guild, {
      title: `${EMOJI.success} ・ ꜱᴇᴛᴜᴘ ᴛᴀᴍᴀᴍ`,
      description:
        `${EMOJI.settings} ・ Log kanalları başarıyla kuruldu.\n\n` +
        `${EMOJI.right} ・ Toplam: **${logs.length} kanal**`
    })
  );
}

// ===================== MODERASYON =====================

// SİL
if (cmd === "sil") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ Yetki Yok`,
      description: `${EMOJI.warn} ・ Mesaj silme yetkin yok.`
    }));
  }

  const amount = parseInt(args[0]);

  if (!amount || amount < 1 || amount > 100) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ Kullanım`,
      description: `${EMOJI.right} ・ .sil 10 (1-100)`
    }));
  }

  const msgs = await message.channel.bulkDelete(amount, true).catch(() => null);

  if (!msgs) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.warn} ・ Hata`,
      description: `14 günden eski mesajlar silinemez.`
    }));
  }

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ Temizlendi`,
    description: `${EMOJI.trash} ・ ${msgs.size} mesaj silindi.`
  }));
}


// KICK
if (cmd === "kick") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ Yetki Yok`,
      description: `${EMOJI.warn} ・ Kick yetkin yok.`
    }));
  }

  const member = message.mentions.members.first();
  const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

  if (!member) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ Kullanım`,
      description: `${EMOJI.right} ・ .kick @kişi sebep`
    }));
  }

  if (!member.kickable) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.warn} ・ Hata`,
      description: `Bu kullanıcıyı atamıyorum.`
    }));
  }

  await member.kick(reason).catch(() => null);

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ Kick`,
    description:
      `${EMOJI.kick} ・ ${member.user.tag}\n` +
      `${EMOJI.info} ・ Sebep: ${reason}`
  }));
}


// BAN
if (cmd === "ban") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.lock} ・ Yetki Yok`,
      description: `${EMOJI.warn} ・ Ban yetkin yok.`
    }));
  }

  const member = message.mentions.members.first();
  const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

  if (!member) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.info} ・ Kullanım`,
      description: `${EMOJI.right} ・ .ban @kişi sebep`
    }));
  }

  if (!member.bannable) {
    return replyE(message, createEmbed(guild, {
      title: `${EMOJI.warn} ・ Hata`,
      description: `Bu kullanıcıyı banlayamıyorum.`
    }));
  }

  await member.ban({ reason }).catch(() => null);

  return replyE(message, createEmbed(guild, {
    title: `${EMOJI.success} ・ Ban`,
    description:
      `${EMOJI.ban} ・ ${member.user.tag}\n` +
      `${EMOJI.info} ・ Sebep: ${reason}`
  }));
}


// ===================== NUKE =====================
if (cmd === "nuke") {
  const channel = message.channel;
  const position = channel.position;
  const parent = channel.parent;
  const perms = channel.permissionOverwrites.cache;

  await channel.delete();

  const newChannel = await guild.channels.create({
    name: channel.name,
    type: channel.type,
    parent: parent,
    position: position,
    permissionOverwrites: perms.map(p => ({
      id: p.id,
      allow: p.allow,
      deny: p.deny
    }))
  });

  newChannel.send({
    embeds: [
      createEmbed(guild, {
        title: line(EMOJI.fire, "ɴᴜᴋᴇ"),
        description: `${EMOJI.success} Kanal başarıyla temizlendi`
      })
    ]
  });
}


    // ===================== YARDIM =====================
    if (cmd === "yardim" || cmd === "help") {
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.star, "ᴛᴇᴀᴍᴄʀᴜᴢ ᴋᴏᴍᴜᴛʟᴀʀ"),
          description:
            `${line(EMOJI.settings, `ᴘʀᴇꜰɪx: ${PREFIX}`)}\n\n` +

            `**${line(EMOJI.settings, "ᴛᴇꜱᴛ / ᴘɪɴɢ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}ping`)}\n` +
            `${line(EMOJI.right, `${PREFIX}test`)}\n\n` +

            `**${line(EMOJI.lock, "ʙᴀꜱᴠᴜʀᴜ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}ticketkategori <kategoriID>`)}\n` +
            `${line(EMOJI.right, `${PREFIX}basvurupanel @rol`)}\n\n` +

            `**${line(EMOJI.weed, "ᴏᴛ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}otyetki ekle/kaldır/liste @kisi`)}\n` +
            `${line(EMOJI.right, `${PREFIX}ot @kisi 25`)}\n` +
            `${line(EMOJI.right, `${PREFIX}envanter / ${PREFIX}envanterler`)}\n` +
            `${line(EMOJI.right, `${PREFIX}top10ot`)}\n` +
            `${line(EMOJI.right, `${PREFIX}otreset @kisi`)}\n` +
            `${line(EMOJI.right, `${PREFIX}otlogkur #kanal`)}\n\n` +

            `**${line(EMOJI.fivem, "ꜰɪᴠᴇᴍ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}id 12`)}\n` +
            `${line(EMOJI.right, `${PREFIX}tag kaisen`)}\n\n` +

            `**${line(EMOJI.shield, "ᴍᴏᴅ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}sil 10`)}\n` +
            `${line(EMOJI.right, `${PREFIX}kick @kisi sebep`)}\n` +
            `${line(EMOJI.right, `${PREFIX}ban @kisi sebep`)}\n` +
            `${line(EMOJI.right, `${PREFIX}nuke`)}\n` +
            `${line(EMOJI.right, `${PREFIX}dm @rol mesaj`)}\n\n` +

            `**${line(EMOJI.headphones, "ꜱᴇꜱ")}**\n` +
            `${line(EMOJI.right, `${PREFIX}sesgir`)}\n` +
            `${line(EMOJI.right, `${PREFIX}sescik`)}\n` +
            `${line(EMOJI.right, `${PREFIX}allvmute`)}\n` +
            `${line(EMOJI.right, `${PREFIX}unvmuteall`)}\n` +
            `${line(EMOJI.right, `${PREFIX}tasi #ses`)}\n` +
            `${line(EMOJI.right, `${PREFIX}sesyasak ekle/kaldır/liste @kisi`)}`
        })
      );
    }

    // ===================== BAKIM =====================
    if (cmd === "bakim") {
      maintenanceMode = !maintenanceMode;
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.settings, "ʙᴀᴋɪᴍ ᴍᴏᴅᴜ"),
          description: maintenanceMode ? line(EMOJI.warn, "ᴀᴄɪʟᴅɪ") : line(EMOJI.success, "ᴋᴀᴘᴀɴᴅɪ")
        })
      );
    }

    // ===================== LOGKUR =====================
    if (cmd === "logkur") {
      const ch = message.mentions.channels.first();
      if (!ch || ch.type !== ChannelType.GuildText) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
            description: line(EMOJI.right, `${PREFIX}logkur #kanal`)
          })
        );
      }

      logChannelId = ch.id;
      config.logChannelId = logChannelId;
      saveJSON(CONFIG_FILE, config);

      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.success, "ʟᴏɢ ᴀʏᴀʀʟᴀɴᴅɪ"),
          description: line(EMOJI.info, `ᴋᴀɴᴀʟ: ${ch}`)
        })
      );
    }

    // ===================== TICKET KATEGORI =====================
    if (cmd === "ticketkategori") {
      const id = args[0];
      const cat = id ? guild.channels.cache.get(id) : null;

      if (!cat || cat.type !== ChannelType.GuildCategory) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.warn, "ʜᴀᴛᴀ"),
            description: line(EMOJI.info, "Geçerli kategori ID gir.")
          })
        );
      }

      ticketCategoryId = cat.id;
      config.ticketCategoryId = ticketCategoryId;
      saveJSON(CONFIG_FILE, config);

      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.success, "ᴋᴀᴛᴇɢᴏʀɪ ᴀʏᴀʀʟᴀɴᴅɪ"),
          description: `${line(EMOJI.info, `${cat}`)}\n${line(EMOJI.right, `ɪᴅ: \`${cat.id}\``)}`
        })
      );
    }

    // ===================== BASVURUPANEL =====================
    if (cmd === "basvurupanel") {
      const staffRole = message.mentions.roles.first();
      if (!staffRole) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
            description: line(EMOJI.right, `${PREFIX}basvurupanel @yetkilirol`)
          })
        );
      }

      if (!ticketCategoryId) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.warn, "ᴋᴀᴛᴇɢᴏʀɪ ʏᴏᴋ"),
            description: line(EMOJI.info, `Önce: ${PREFIX}ticketkategori <kategoriID>`)
          })
        );
      }

      ticketStaffRoleId = staffRole.id;
      config.ticketStaffRoleId = ticketStaffRoleId;
      saveJSON(CONFIG_FILE, config);

      // Panel (görseldeki "Ekip Başvuru" formatı)
      const panelEmbed = createEmbed(guild, {
        title: `${EMOJI.info} Ekip Başvuru`,
        description:
          `**${SERVER_NAME}** sunucusunda bir başvuru oluşturmak veya destek almak için aşağıdaki butona tıklayın.\n\n` +
          `Butona tıkladıktan sonra sizin için özel bir başvuru kanalı açılacak. Sadece yetkililer ve siz ticketi görüntüleyebilirsiniz.`,
        image: PANEL_IMAGE
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_open")
          .setStyle(ButtonStyle.Danger)
          .setLabel("Başvuru Oluştur")
          .setEmoji("📝")
      );

      await message.channel.send({ embeds: [panelEmbed], components: [row] }).catch(() => {});

      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.success, "ᴘᴀɴᴇʟ ɢᴏ̈ɴᴅᴇʀɪʟᴅɪ"),
          description: line(EMOJI.info, "Başvuru paneli kuruldu.")
        })
      );
    }

    // ===================== OTLOGKUR =====================
    if (cmd === "otlogkur") {
      const ch = message.mentions.channels.first();
      if (!ch || ch.type !== ChannelType.GuildText) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
            description: line(EMOJI.right, `${PREFIX}otlogkur #kanal`)
          })
        );
      }
      otLogChannelId = ch.id;
      saveJSON(OTLOG_FILE, otLogChannelId);

      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.success, "ᴏᴛ ʟᴏɢ ᴀʏᴀʀʟᴀɴᴅɪ"),
          description: line(EMOJI.info, `ᴋᴀɴᴀʟ: ${ch}`)
        })
      );
    }
// ===================== ETKINLIK (LIMITLI) =====================
if (cmd === "etkinlik") {

  if (!isStaff(userId)) {
    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
        description: line(EMOJI.warn, "Sadece yetkililer.")
      })
    );
  }

  const limit = parseInt(args[args.length - 1]);
  const titleText = args.slice(0, -1).join(" ").trim();

  if (!titleText || isNaN(limit) || limit < 1) {
    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
        description: line(
          EMOJI.right,
          `${PREFIX}etkinlik Scrim Turnuvası 10`
        )
      })
    );
  }

  const embed = createEmbed(guild, {
    title: `${EMOJI.star} ・ ${titleText}`,
    description:
      `${EMOJI.settings} ・ Katılmak için butona bas.\n\n` +
      `${EMOJI.sagok} ・ **Katılanlar (0/${limit})**`,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("temp")
      .setLabel("Katıldım")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅")
  );

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  const buttonId = `etkinlik_join_${msg.id}`;

  row.components[0].setCustomId(buttonId);

  await msg.edit({
    components: [row]
  });

  etkinlikList.set(msg.id, {
    users: [],
    limit: limit,
    title: titleText,
    closed: false
  });
}

    
    // ===================== OTYETKI =====================
    if (cmd === "otyetki") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
            description: line(EMOJI.warn, "Sadece admin.")
          })
        );
      }

      const sub = (args.shift() || "").toLowerCase();

      if (sub === "liste") {
        const list = otYetkililer.length
          ? otYetkililer.map((id, i) => `${EMOJI.right} ・ **${i + 1}.** <@${id}>`).join("\n")
          : line(EMOJI.warn, "Liste boş.");

        return replyE(message, createEmbed(guild, { title: line(EMOJI.crown, "ᴏᴛ ʏᴇᴛᴋɪʟɪʟᴇʀ"), description: list }));
      }

      const target = message.mentions.users.first();
      if (!target) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
            description:
              `${line(EMOJI.right, `${PREFIX}otyetki ekle @kisi`)}\n` +
              `${line(EMOJI.right, `${PREFIX}otyetki kaldır @kisi`)}\n` +
              `${line(EMOJI.right, `${PREFIX}otyetki liste`)}`
          })
        );
      }

      if (sub === "ekle") {
        if (!otYetkililer.includes(target.id)) otYetkililer.push(target.id);
        saveJSON(AUTH_FILE, otYetkililer);
        return replyE(message, createEmbed(guild, { title: line(EMOJI.success, "ᴏᴛ ʏᴇᴛᴋɪ ᴇᴋʟᴇɴᴅɪ"), description: line(EMOJI.info, `${target} artık OT kullanabilir.`) }));
      }

      if (sub === "kaldır" || sub === "kaldir") {
        otYetkililer = otYetkililer.filter((x) => x !== target.id);
        saveJSON(AUTH_FILE, otYetkililer);
        return replyE(message, createEmbed(guild, { title: line(EMOJI.success, "ᴏᴛ ʏᴇᴛᴋɪ ᴋᴀʟᴅɪʀɪʟᴅɪ"), description: line(EMOJI.info, `${target} artık OT kullanamaz.`) }));
      }

      return replyE(message, createEmbed(guild, { title: line(EMOJI.warn, "ʜᴀᴛᴀ"), description: line(EMOJI.info, "Alt komut: ekle/kaldır/liste") }));
    }

    // ===================== OT (FIXED PARSE) =====================
    if (cmd === "ot") {
      if (!isOtYetkili(userId) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.lock, "ʏᴇᴛᴋɪ ʏᴏᴋ"),
            description: line(EMOJI.warn, "Sadece OT yetkilisi / admin.")
          })
        );
      }

      const target = message.mentions.users.first();
      const amountToken = args.find((t) => /^-?\d+$/.test(t));
      const amount = amountToken ? parseInt(amountToken, 10) : NaN;

      if (!target || Number.isNaN(amount)) {
        return replyE(
          message,
          createEmbed(guild, {
            title: `${EMOJI.info} ・ ᴋᴜʟʟᴀɴɪᴍ`,
            description: `${EMOJI.right} ・ \`${PREFIX}ot @kisi 25\``
          })
        );
      }

      ensureUser(target.id);
      envanter[target.id].ot += amount;
      if (envanter[target.id].ot < 0) envanter[target.id].ot = 0;
      saveJSON(INV_FILE, envanter);

      const emb = createEmbed(guild, {
        title: line(EMOJI.weed, "ᴏᴛ ɢᴜ̈ɴᴄᴇʟʟᴇɴᴅɪ"),
        description:
          `${line(EMOJI.info, `Kullanıcı: ${target}`)}\n` +
          `${line(EMOJI.right, `İşlem: ${amount > 0 ? "+" : ""}${formatNumber(amount)} OT`)}\n` +
          `${line(EMOJI.box, `Toplam: ${formatNumber(envanter[target.id].ot)} OT`)}`
      });

      await sendOtLog(guild, emb);
      return replyE(message, emb);
    }

    // ===================== ENVANTER / ENVANTERLER =====================
    if (cmd === "envanter" || cmd === "envanterler") {
      ensureUser(userId);
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.box, "ᴇɴᴠᴀɴᴛᴇʀ"),
          description: line(EMOJI.weed, `Toplam: **${formatNumber(envanter[userId].ot)} OT**`)
        })
      );
    }

    // ===================== TOP10OT =====================
    if (cmd === "top10ot") {
      const arr = Object.entries(envanter)
        .map(([id, d]) => ({ id, ot: d?.ot || 0 }))
        .sort((a, b) => b.ot - a.ot)
        .slice(0, 10);

      const list = arr.length
        ? arr.map((x, i) => `${EMOJI.right} ・ **${i + 1}.** <@${x.id}> → **${formatNumber(x.ot)} OT**`).join("\n")
        : line(EMOJI.warn, "Henüz veri yok.");

      return replyE(message, createEmbed(guild, { title: line(EMOJI.crown, "ᴛᴏᴘ 10 ᴏᴛ"), description: list }));
    }

    // ===================== OTRESET =====================
    if (cmd === "otreset") {
      const target = message.mentions.users.first();
      if (!target) {
        return replyE(message, createEmbed(guild, { title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"), description: line(EMOJI.right, `${PREFIX}otreset @kisi`) }));
      }

      ensureUser(target.id);
      envanter[target.id].ot = 0;
      saveJSON(INV_FILE, envanter);

      return replyE(message, createEmbed(guild, { title: line(EMOJI.refresh, "ᴏᴛ ꜱɪꜰɪʀʟᴀɴᴅɪ"), description: line(EMOJI.success, `${target} OT sıfırlandı.`) }));
    }
    // ===================== ID (FiveM) =====================
if (cmd === "id") {
  const playerId = args[0];

  if (!playerId || isNaN(playerId)) {
    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
        description: line(EMOJI.right, `${PREFIX}id 12`)
      })
    );
  }

  try {
    const data = await getPlayerFromCFX(playerId);

    if (!data.found) {
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.warn, "ʙᴜʟᴜɴᴀᴍᴀᴅɪ"),
          description: line(EMOJI.warn, "Oyuncu bulunamadı.")
        })
      );
    }

    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.fivem, "ꜰɪᴠᴇᴍ ᴏʏᴜɴᴄᴜ"),
        fields: [
          {
            name: line(EMOJI.info, "İsim"),
            value: `\`${data.name}\``
          },
          {
            name: line(EMOJI.settings, "ID"),
            value: `\`${data.id}\``,
            inline: true
          },
          {
            name: line(EMOJI.right, "Ping"),
            value: `\`${data.ping}\``,
            inline: true
          },
{
  name: line(EMOJI.search, "Steam"),
  value: `\`${data.steam}\``
},


          {
            name: line(EMOJI.search, "Discord"),
            value: `\`${data.discord}\``
          }
        ]
      })
    );
  } catch (err) {
    console.error("ID CMD ERROR:", err);

    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.warn, "ᴀᴘɪ ʜᴀᴛᴀ"),
        description: line(
          EMOJI.warn,
          err?.message || "FiveM API bağlantı hatası"
        )
      })
    );
  }
}

    // ===================== TAG (FiveM) =====================
if (cmd === "tag") {
  const search = args.join(" ").trim();

  if (!search) {
    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
        description: line(EMOJI.right, `${PREFIX}tag kaisen`)
      })
    );
  }

  try {
    const json = await getServerPlayersCached();
    const players = json?.Data?.players || [];

    const matched = players.filter((p) =>
      cleanFiveMName(p.name).includes(search.toLowerCase())
    );

    if (!matched.length) {
      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.warn, "ʙᴜʟᴜɴᴀᴍᴀᴅɪ"),
          description: line(EMOJI.warn, "Oyuncu bulunamadı.")
        })
      );
    }

    const list = matched
      .slice(0, 25)
      .map(
        (p) =>
          `${EMOJI.right} ・ **${p.name}** (ID: \`${p.id}\` | Ping: \`${p.ping}\`)`
      )
      .join("\n");

    return replyE(
      message,
      createEmbed(guild, {
        title: `${EMOJI.search} ・ ᴛᴀɢ ᴀʀᴀᴍᴀ`,
        description:
          `${EMOJI.success} ・ Toplam: **${matched.length} kişi**\n\n` + list
      })
    );
  } catch (err) {
    console.error("TAG ERROR:", err);

    return replyE(
      message,
      createEmbed(guild, {
        title: line(EMOJI.warn, "ᴀᴘɪ ʜᴀᴛᴀ"),
        description: line(
          EMOJI.warn,
          err?.message || "FiveM API bağlantı hatası"
        )
      })
    );
  }
}


    // ===================== DM =====================
    if (cmd === "dm") {
      const role = message.mentions.roles.first();
      if (!role) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.info, "ᴋᴜʟʟᴀɴɪᴍ"),
            description: line(EMOJI.right, `${PREFIX}dm @rol mesaj`)
          })
        );
      }

      const text = args.join(" ").replace(role.toString(), "").trim();
      if (!text) {
        return replyE(
          message,
          createEmbed(guild, {
            title: line(EMOJI.warn, "ʜᴀᴛᴀ"),
            description: line(EMOJI.info, "Gönderilecek mesajı yaz.")
          })
        );
      }

      let sent = 0;
      let fail = 0;

      for (const member of role.members.values()) {

  await new Promise(r => setTimeout(r, 1200)); // delay

        try {
          await member.send(text);
          sent++;
        } catch {
          fail++;
        }
      }

      return replyE(
        message,
        createEmbed(guild, {
          title: line(EMOJI.success, "ᴅᴍ ɢᴏ̈ɴᴅᴇʀɪʟᴅɪ"),
          description:
            `${line(EMOJI.info, `Başarılı: ${sent}`)}\n` +
            `${line(EMOJI.warn, `Başarısız: ${fail}`)}`
        })
      );
    }

    // ===================== SES GİR =====================
    if (cmd === "sesgir") {
      const vc = message.member.voice.channel;
      if (!vc) {
        return replyE(message, createEmbed(guild, {
          title: line(EMOJI.warn, "ʜᴀᴛᴀ"),
          description: "Ses kanalında değilsin."
        }));
      }

      joinVoiceChannel({
        channelId: vc.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });

      return replyE(message, createEmbed(guild, {
        title: line(EMOJI.success, "ꜱᴇꜱ"),
        description: "Ses kanalına girildi."
      }));
    }
// ===================== URL KORUMA =====================
if (cmd === "urlkoruma") {
  urlProtection.enabled = !urlProtection.enabled;

  return replyE(message, createEmbed(guild, {
    title: line(EMOJI.shield, "ᴜʀʟ ᴋᴏʀᴜᴍᴀ"),
    description: urlProtection.enabled
      ? `${EMOJI.success} URL koruma **AÇILDI**\n${EMOJI.warn} URL değiştiren **ANINDA BANLANIR**`
      : `${EMOJI.error} URL koruma **KAPATILDI**`
  }));
}
    // ===================== GUARD PANEL =====================
if (cmd === "guardpanel") {
  return replyE(message, createEmbed(guild, {
    title: line(EMOJI.shield, "ɢᴜᴀʀᴅ ᴘᴀɴᴇʟ"),
    description: `
${EMOJI.success} **URL Koruma:** ${urlProtection.enabled ? "Açık" : "Kapalı"}
${EMOJI.success} **Rol Yetki Koruma:** ${guardSystem.roleProtection ? "Açık" : "Kapalı"}

${EMOJI.warn} Yetkisiz işlemler **ANINDA BAN**
    `
  }));
}


client.on("guildUpdate", async (oldGuild, newGuild) => {
  try {
    if (!urlProtection.enabled) return;

    if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
      const logs = await newGuild.fetchAuditLogs({
        type: 1, // GUILD_UPDATE
        limit: 1
      });

client.on("roleUpdate", async (oldRole, newRole) => {
  try {
    if (!guardSystem.roleProtection) return;

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      const logs = await newRole.guild.fetchAuditLogs({
        type: 31, // ROLE_UPDATE
        limit: 1
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      // BOT kendisi yaptıysa banlama
      if (executor.id === client.user.id) return;

      const member = await newRole.guild.members.fetch(executor.id).catch(() => null);
      if (!member) return;

      await member.ban({
        reason: "Guard | Rol yetkisi değiştirildi"
      });

      await newRole.edit({
        permissions: oldRole.permissions
      });

      console.log(`[GUARD] Rol yetkisi değişti → ${executor.tag} BAN`);
    }
  } catch (err) {
    console.error("ROL GUARD HATASI:", err);
  }
});

      
      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      const member = await newGuild.members.fetch(executor.id).catch(() => null);
      if (!member) return;

      await member.ban({
        reason: "URL Koruma | Sunucu URL'si değiştirildi"
      });

      console.log(`[URL KORUMA] ${executor.tag} BANLANDI`);
    }
  } catch (err) {
    console.error("URL KORUMA HATASI:", err);
  }
});

    // ===================== SES ÇIK =====================
    if (cmd === "sescik") {
      const conn = getVoiceConnection(guild.id);
      if (!conn) {
        return replyE(message, createEmbed(guild, {
          title: line(EMOJI.warn, "ʜᴀᴛᴀ"),
          description: "Zaten seste değilim."
        }));
      }

      conn.destroy();

      return replyE(message, createEmbed(guild, {
        title: line(EMOJI.success, "ꜱᴇꜱ"),
        description: "Ses kanalından çıkıldı."
      }));
    }
  } catch (err) {
    console.error("CMD ERROR:", err);
  }
});



// ===================== LOGIN =====================
client.login(TOKEN)
  .then(() => console.log("✅ Discord Login OK"))
  .catch((err) => console.error("❌ Discord Login FAIL:", err));
