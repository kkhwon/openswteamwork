import { GoogleGenAI } from "@google/genai";

export const FALLBACK_SUGGESTIONS = {
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
    "그동안 고마웠던 소중한 친구 한 명에게 가벼운 안부 편지나 연락 보내기"
  ],
  "우울": [
    "좋아하는 한 편의 영화나 가벼운 애니메이션 골라 시청하기",
    "따뜻한 온수로 온몸을 녹이는 반신욕 또는 샤워 즐기기",
    "자신을 위한 작고 달콤한 디저트나 초콜릿 하나 선물하기"
  ],
  "불안": [
    "생각나는 모든 고민과 원인을 종이에 손으로 적어 객관화하기",
    "4초간 들이마시고, 4초 멈추고, 4초 내쉬는 박스 호흡 5회 진행하기",
    "주변의 5가지 파란색 사물을 보며 천천히 심호흡하기"
  ]
};

export const FALLBACK_QUOTES = [
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "작은 오늘의 선택이 미래의 위대한 당신을 만듭니다.", author: "스티브 잡스" },
  { text: "시작하는 방법은 말을 멈추고 행동하기 시작하는 것이다.", author: "월트 디즈니" },
  { text: "행동은 모든 성공의 기초적인 열쇠이다.", author: "파블로 피카소" },
  { text: "어제보다 나은 오늘을 만드는 것은 오직 당신의 손에 달렸다.", author: "미래의 나" },
  { text: "작은 물방울이 모여 결국 단단한 바위를 뚫는다.", author: "동양 격언" },
  { text: "가장 어두운 밤도 결국 지나가고 아침 해가 떠오른다.", author: "빅토르 위고" },
  { text: "길이 없으면 만들고, 만들 수 없다면 새로 개척하라.", author: "아문센" }
];

export function cleanJsonMarkdown(text = "") {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;

  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "netlify-haru-routine-planner"
        }
      }
    });
  } catch (error) {
    console.error("Failed to initialize Gemini AI client:", error);
    return null;
  }
}

export function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}
