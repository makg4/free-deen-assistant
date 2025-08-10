// Minimal Express server for Free Deen Assistant
// Note: This is a reference. You must wire in your chosen LLM provider and embeddings.
// npm i express cors dotenv pg pgvector qdrant-client node-fetch

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ---- Config ----
const USE_VECTOR_DB = process.env.VECTOR_DB || "pgvector"; // or "qdrant"
const LLM_ENDPOINT = process.env.LLM_ENDPOINT || ""; // your provider endpoint
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const EMBED_ENDPOINT = process.env.EMBED_ENDPOINT || ""; // embeddings
const PORT = process.env.PORT || 8080;

// ---- Helpers ----
async function embed(texts) {
  // Replace with your embeddings provider (e.g., bge-m3 or similar hosted endpoint)
  // Return an array of float vectors
  const resp = await fetch(EMBED_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: texts })
  });
  if (!resp.ok) throw new Error("Embedding failed");
  return await resp.json(); // [[...], [...]]
}

async function llmCompose({ question, passages, madhhab, locale, max_tokens }) {
  const system = `You are a conservative Islamic assistant constrained to ONLY the provided sources.
- If sources are insufficient or conflicting, say you are not sure and suggest consulting a qualified scholar.
- Cite inline using short locators like "Qur'an 4:103" or "Bukhari 1234".
- Note madhhab-specific differences if relevant (Hanafi/Shafi'i/Maliki/Hanbali); otherwise present majority view and mention differences briefly.
- Keep answers concise (< 200 words) unless user asks for detail.
- Do NOT invent hadith numbers or verses.
- If the user asks outside Islamic topics, politely decline.`;

  const user = JSON.stringify({
    question,
    madhhab,
    locale,
    passages // array of {text, title, uri, locator}
  });

  const resp = await fetch(LLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || "your-small-model",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.2,
      max_tokens: Math.min(800, max_tokens || 600)
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error("LLM error: " + text);
  }
  const data = await resp.json();
  const answer = data.choices?.[0]?.message?.content || "";
  return answer;
}

// ---- Fake in-memory store for demo ----
const DEMO_PASSAGES = [
  {
    id: "q-4-103",
    text: "And when you have completed the prayer, remember Allah standing, sitting, or [lying] on your sides... Indeed, prayer has been decreed upon the believers a decree of specified times.",
    title: "Qur'an 4:103 (transl. sample)",
    uri: "https://example.com/quran/4/103",
    locator: "Qur'an 4:103"
  }
];

// ---- Routes ----
app.post("/answer", async (req, res) => {
  try {
    const { question, madhhab = "none", locale = "en", top_k = 8, max_tokens = 600 } = req.body || {};
    if (!question) return res.status(400).json({ error: "question required" });

    // 1) Embed query and retrieve top passages (stubbed for demo)
    // const [qVec] = await embed([question]);
    // const passages = await retrieveNearest(qVec, top_k);
    const passages = DEMO_PASSAGES; // TODO: swap with actual retrieval

    // 2) Compose with LLM
    const answer = await llmCompose({ question, passages, madhhab, locale, max_tokens });

    // 3) Build citations
    const citations = passages.map(p => ({
      source_id: p.id, title: p.title, uri: p.uri, locator: p.locator
    }));

    // 4) Heuristic confidence: number of aligned passages
    const confidence = Math.min(1.0, citations.length / 8);

    return res.json({ answer, citations, confidence, escalated: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});
app.get("/ayah-of-day", async (req, res) => {
  // Tiny rotating sample set (replace with your real dataset later)
  const samples = [
    {
      surah: 1, ayah: 5,
      arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us to the straight path."
    },
    {
      surah: 2, ayah: 286,
      arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      translation: "Allah does not burden a soul beyond that it can bear."
    },
    {
      surah: 94, ayah: 6,
      arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "Indeed, with hardship comes ease."
    },
    {
      surah: 4, ayah: 103,
      arabic: "فَإِذَا قَضَيْتُمُ الصَّلَاةَ فَاذْكُرُوا اللَّهَ...",
      translation: "And when you have completed the prayer, remember Allah..."
    }
  ];

  // Optional seed param → deterministic pick if provided
  const seed = Number(req.query.seed || Date.now());
  const idx = Math.abs(seed) % samples.length;
  const pick = samples[idx];

  return res.json({
    seed_used: seed,      // or "s" if you used my latest snippet
index_used: idx
    ayah: pick,
    reflection: "A short reflection placeholder. (We’ll plug real tafsir later.)",
    sources: [{ title: "Sample translation for demo", uri: "https://example.com" }]
  });
});


app.get("/prayertimes", async (req, res) => {
  // You can compute locally using e.g. adhan-js; here we just echo request
  const { lat, lon, date = new Date().toISOString().slice(0,10), method = "MuslimWorldLeague" } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });
  // TODO: integrate proper prayer times library (on-device recommended)
  return res.json({
    fajr: "05:00",
    sunrise: "06:05",
    dhuhr: "12:12",
    asr: "15:34",
    maghrib: "18:47",
    isha: "19:57",
    meta: { lat, lon, date, method }
  });
});

app.listen(PORT, () => console.log("Free Deen Assistant listening on :" + PORT));
