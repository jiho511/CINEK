import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { fallbackMovies } from "./src/fallbackData.js"; // Wait, in ESM we import fallbackData.ts or .js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidApiKey = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "";

  if (hasValidApiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini API client initialized successfully.");
    } catch (e) {
      console.error("Failed to initialize Gemini API client:", e);
    }
  } else {
    console.log("No valid GEMINI_API_KEY found. Operating in Fallback Mode.");
  }

  // --- API Routes ---
  
  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAi: !!ai });
  });

  // 2. Fetch Box Office Rankings
  app.get("/api/boxoffice", async (req, res) => {
    const dateStr = (req.query.date as string) || "2026-06-05";

    if (!ai) {
      return res.json({
        date: dateStr,
        list: fallbackMovies,
        source: "fallback",
        info: "Fallback active: API Key is not configured."
      });
    }

    try {
      const prompt = `Find the actual South Korean movie box office ranking list for the date: ${dateStr}. 
Required format is a JSON array of exactly 10 movies.
Each movie object must follow this strict JSON schema structure:
{
  "rank": number (1 to 10),
  "titleKo": string (Korean movie title),
  "titleEn": string (English movie title),
  "releaseDate": string (YYYY-MM-DD),
  "dailyAudience": number (approximately, or real value if found),
  "totalAudience": number (approximately, or real value if found),
  "rankChange": number (-5 to +5, or 0 if no change or new entry),
  "genre": string[] (array of genres),
  "rating": number (user rating out of 10),
  "runtime": number (runtime in minutes),
  "synopsis": string (short Korean synopsis/description),
  "director": string (director name),
  "cast": string[] (main cast as string array),
  "trailerUrl": string (embed youtube url if known, otherwise a search trailer link or empty),
  "posterUrl": string (Unsplash image query url for poster style, or fallback image related to cinema)
}

Make sure to search the web for the ACTUAL box office status around ${dateStr} in South Korea. Return ONLY a single valid JSON object under the key "list":
{
  "list": [ ... ]
}
Make sure all strings are in valid JSON format. Direct markdown blocks must be avoided. No conversational introduction or wrap-up texts.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text?.trim() || "";
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.list) && parsed.list.length > 0) {
        return res.json({
          date: dateStr,
          list: parsed.list,
          source: "live"
        });
      }
      throw new Error("Invalid structure from Gemini response");
    } catch (error: any) {
      console.error("Gemini BoxOffice API failed, serving hardcoded fallback:", error.message);
      return res.json({
        date: dateStr,
        list: fallbackMovies,
        source: "fallback",
        error: error.message
      });
    }
  });

  // 3. Cinematic chat system with Web Grounding
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      // Simulate rich static responses
      let reply = "실시간 인공지능 모드가 오프라인 상태이나, 안내 드립니다:\n\n";
      const query = message.toLowerCase();
      if (query.includes("설계자")) {
        reply += "영화 **'설계자'**는 청부 살인을 사고사로 완벽히 위장하는 설계팀 이야기로 강동원 배우님이 뛰어난 열연을 보여주고 있습니다. 미스터리 서스펜스 취향에 추천합니다.";
      } else if (query.includes("그녀가 죽었다")) {
        reply += "영화 **'그녀가 죽었다'**는 변요한, 신혜선 주연의 미스터리 추적물로, 남의 사생활을 훔쳐보는 흥미진진한 설정과 긴박감 넘치는 전개로 호평받고 있습니다.";
      } else if (query.includes("퓨리오사")) {
        reply += "영화 **'퓨리오사: 매드맥스 사가'**는 매드맥스 시리즈의 프리퀄 액션 SF 대작으로 안야 테일러 조이의 폭발적인 생존 액션을 감상하실 수 있습니다.";
      } else if (query.includes("추천") || query.includes("재밌는")) {
        reply += "현재 평점이 가장 높은 대작은 **'인사이드 아웃 2'** (9.1점)와 안야 테일러 조이의 **'퓨리오사: 매드맥스 사가'** 입니다. 한국형 누아르나 미스터리를 원하시면 강동원의 **'설계자'**나 변요한의 **'그녀가 죽었다'**를 강추 드립니다!";
      } else {
        reply += "2026년 6월 어제(6월5일) 기준 대한민국 박스오피스 상위권은 **'설계자'**, **'퓨리오사'**, **'그녀가 죽었다'**가 차지하고 있습니다. 영화 이름을 말씀해주시면 더 자세히 안내할 수 있어요!";
      }

      return res.json({ reply, sources: [] });
    }

    try {
      const prompt = `You are "무비톡 (MovieTalk)", a highly knowledgeable, passionate, and polite cinema critic and box office guide assistant for Korean audiences.
Please answers the user's query about South Korean box office, specific theatrical films (cast, synopsis, trailers, opinions, or rankings), theater schedules, or custom film recommendations.
Reply clearly in beautiful Korean, with formatted markdown and rich reviews.
Always use Google Search grounding. Ground on recent sources where appropriate.
Avoid complex developer jargon. Provide active film lover vibes.

User's query: ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const reply = response.text || "답변을 생성하는 도중 오류가 발생했습니다.";
      
      const sources: { title: string; url: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        for (const chunk of chunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri
            });
          }
        }
      }

      return res.json({ reply, sources });
    } catch (error: any) {
      console.error("Gemini Chat API Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // --- Serve Frontend ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Movie Box Office App backend running on http://localhost:${PORT}`);
  });
}

startServer();
