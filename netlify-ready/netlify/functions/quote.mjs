import { FALLBACK_QUOTES, cleanJsonMarkdown, getGeminiClient, json } from "../lib/gemini-utils.mjs";

export default async function quote(req) {
  if (req.method !== "GET") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const ai = getGeminiClient();

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
          temperature: 0.9
        }
      });

      const cleaned = cleanJsonMarkdown(response.text || "");
      const parsed = JSON.parse(cleaned);

      if (parsed?.text && parsed?.author) {
        return json(parsed);
      }
    } catch (error) {
      console.error("Gemini quote API failed, using fallback:", error);
    }
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return json(FALLBACK_QUOTES[randomIndex]);
}

export const config = {
  path: "/api/gemini/quote"
};
