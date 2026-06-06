import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Netlify serverless functions path normalization middleware
app.use((req, res, next) => {
  // 1. If Netlify invokes the function using the full .netlify/functions path, strip it
  if (req.url.startsWith("/.netlify/functions/api")) {
    req.url = req.url.replace("/.netlify/functions/api", "");
  }
  
  // 2. Ensure the URL starts with /api for matching Express routing targets
  if (!req.url.startsWith("/api") && !req.url.startsWith("/assets") && req.url !== "/" && !req.url.includes(".")) {
    req.url = "/api" + req.url;
  }
  
  next();
});

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI client successfully initialized with provided key.");
  } catch (error) {
    console.error("Failed to initialize Gemini AI client:", error);
  }
} else {
  console.log("Using rich fallback engine for mood recommendations and quotes.");
}

// Fallbacks in Korean to match screens precisely
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  "집중": [
    "포모도로 공부법 적용하여 25분 집중, 5분 휴식 반복하기",
    "알고리즘 고난도 문제 2개 풀고 코드 오답 정리 진행하기",
    "기술 서적 또는 관련 블로그 아티클 1편 정독하고 기록하기"
  ],
  "휴식": [
    "잔잔한 보사노바 음악 들으며 따뜻한 차 한 잔 마시기",
    "스트레칭 10분 진행하며 굳은 몸 천천히 풀어주기",
    "스마트폰 멀리 두고 15분 동안 조용히 누워 눈 감고 있기"
  ],
  "가벼움": [
    "주변 공원 산책하며 좋아하는 신나는 오디오 북 듣기",
    "오랫동안 미뤄두었던 방 책상 및 서랍 레이아웃 정리하기",
    "그동안 고마웠던 소중한 친구 한 명에게 가벼운 안편 편지나 연락 보내기"
  ],
  "우울": [
    "좋아하는 한 편의 영화나 가벼운 애니메이션 골라 시청하기",
    "따뜻한 온수로 온몸을 녹이는 반신욕 또는 샤워 즐기기",
    "자신을 위한 작고 달콤한 디저트나 초콜릿 하나 선물하기"
  ],
  "불안": [
    "생각나는 모든 고민과 원인을 종이에 손으로 적어 객관화하기",
    "4초간 들이마시고, 4초 멈추고, 4초 내쉬는 박스 호흡 5회 진행하기",
    "주변의 5가지 파란색 사물을 보며 천천히 심호흡하기 (그라운딩)"
  ]
};

const FALLBACK_QUOTES = [
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "작은 오늘의 선택이 미래의 위대한 당신을 만듭니다.", author: "스티브 잡스" },
  { text: "시작하는 방법은 말을 멈추고 행동하기 시작하는 것이다.", author: "월트 디즈니" },
  { text: "행동은 모든 성공의 기초적인 열쇠이다.", author: "파블로 피카소" },
  { text: "어제보다 나은 오늘을 만드는 것은 오직 당신의 손에 달렸다.", author: "미래의 나" },
  { text: "작은 물방울이 모여 결국 단단한 바위를 뚫는다.", author: "동양 격언" },
  { text: "가장 어두운 밤도 결국 지나가고 아침 해가 떠오른다.", author: "빅토르 위고" },
  { text: "길이 없으면 만들고, 만들 수 없다면 새로 개척하라.", author: "아문센" }
];

// Helper to clean response strings from LLM markdown
function cleanJsonMarkdown(text: string): string {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// REST api endpoints
app.post("/api/gemini/suggest-todo", async (req, res) => {
  const { mood } = req.body;
  if (!mood) {
    return res.status(400).json({ error: "Mood is required" });
  }

  // If AI Client is available, call Gemini for custom mood-based schedules
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `사용자의 현재 기분 혹은 상태는 "${mood}" 입니다. 
이 기분/상태에 처한 고등학생/대학생/성인 사용자가 삶을 돌보고 기운을 내거나 생산성을 유지할 수 있도록 돕는 실질적인 맞춤형 할 일(To-do) 3가지를 구체적이고 매력적으로 한국어로 제안해주세요.
각 할 일은 35자 내외의 실제 행동 중심적인 한글 문장이여야 합니다.

출력 포맷은 반드시 아래와 같은 속성을 가진 주석 없는 순수 JSON 리스트 형식이어야 합니다:
["할 일 내용 1", "할 일 내용 2", "할 일 내용 3"]

주의: 마크다운 코드 블록(\`\`\`)을 쓰지 말고 순수 JSON 문자열만 반환해 주세요.`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const rawText = response.text || "";
      const cleaned = cleanJsonMarkdown(rawText);
      const list = JSON.parse(cleaned);
      if (Array.isArray(list) && list.length > 0) {
        return res.json({ suggestions: list });
      }
    } catch (error) {
      console.error("Gemini suggestion API failed, rolling back to local fallbacks:", error);
    }
  }

  // Rollback if Gemini doesn't exist or errors out
  const fallbackList = FALLBACK_SUGGESTIONS[mood] || FALLBACK_SUGGESTIONS["집중"];
  return res.json({ suggestions: fallbackList });
});

app.get("/api/gemini/quote", async (req, res) => {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `하루를 활기차게 시작하고 삶에 신선한 영감을 불어넣을 수 있는 아름다운 한국어 명언과 그 인물/저자를 짧게 새로 지어내거나 실존 명언을 추천해주세요.
글자 수는 35자 내외의 마음에 와닿는 문구이어야 합니다.

반드시 아래 JSON 형태로 반환해 주세요:
{
  "text": "명언 문구 내용",
  "author": "작가 혹은 유명인 이름"
}

주의: 마크다운 코드 블록을 작성하지 말고 순수 JSON 문자열만 반환해주세요.`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.9,
        }
      });

      const rawText = response.text || "";
      const cleaned = cleanJsonMarkdown(rawText);
      const parsed = JSON.parse(cleaned);
      if (parsed.text && parsed.author) {
        return res.json(parsed);
      }
    } catch (error) {
      console.error("Gemini quote API failed, rolling back to local quote:", error);
    }
  }

  // Rollback to local items randomly
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return res.json(FALLBACK_QUOTES[randomIndex]);
});

// Integration with Vite
async function startBootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev server hosting live page at http://localhost:${PORT}`);
  });
}

if (process.env.NETLIFY !== "true") {
  startBootstrap().catch((err) => {
    console.error("Failed to bootstrap Express + Vite server:", err);
  });
}

export { app };
