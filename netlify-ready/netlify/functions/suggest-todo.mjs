import { FALLBACK_SUGGESTIONS, cleanJsonMarkdown, getGeminiClient, json } from "../lib/gemini-utils.mjs";

export default async function suggestTodo(req) {
  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mood = body?.mood;
  if (!mood || typeof mood !== "string") {
    return json({ error: "Mood is required" }, { status: 400 });
  }

  const ai = getGeminiClient();

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
          temperature: 0.7
        }
      });

      const cleaned = cleanJsonMarkdown(response.text || "");
      const suggestions = JSON.parse(cleaned);

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return json({ suggestions });
      }
    } catch (error) {
      console.error("Gemini suggestion API failed, using fallback:", error);
    }
  }

  return json({ suggestions: FALLBACK_SUGGESTIONS[mood] || FALLBACK_SUGGESTIONS["집중"] });
}

export const config = {
  path: "/api/gemini/suggest-todo"
};
