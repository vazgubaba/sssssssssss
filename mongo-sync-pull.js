// Bu script ayrı bir process olarak çalışır (execSync ile çağrılır).
// Amaç: bot.js başlamadan ÖNCE, Mongo'daki tüm kayıtları yerel data/ klasörüne
// senkron şekilde indirmek (CommonJS'te top-level await olmadığı için bu ayrı
// process + execSync yöntemi kullanılıyor).
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGODB_URI = (process.env.MONGODB_URI || "").trim();
const MONGODB_DB = (process.env.MONGODB_DB || "discord_bot").trim();
const DATA_DIR = path.join(__dirname, "data");

async function main() {
  if (!MONGODB_URI) {
    console.log("ℹ️ [mongo-sync-pull] MONGODB_URI yok, atlanıyor.");
    return;
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let client;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    await client.connect();
    const col = client.db(MONGODB_DB).collection("kv_store");
    const docs = await col.find({}).toArray();

    for (const doc of docs) {
      const file = path.join(DATA_DIR, doc._id);
      try {
        fs.writeFileSync(file, JSON.stringify(doc.value, null, 2));
        console.log(`✅ [mongo-sync-pull] ${doc._id} indirildi.`);
      } catch (e) {
        console.error(`❌ [mongo-sync-pull] ${doc._id} yazılamadı:`, e.message);
      }
    }
    console.log(`✅ [mongo-sync-pull] Toplam ${docs.length} kayıt senkronize edildi.`);
  } catch (e) {
    console.error("❌ [mongo-sync-pull] Mongo bağlantı/çekme hatası:", e.message);
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(0));
