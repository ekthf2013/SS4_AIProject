import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// API Keys - 실무에서는 .env 파일이나 보안 저장소에 보관해야 합니다.
const TAVILY_API_KEY = "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";

/**
 * 전용 컨퍼런스 서비스
 * 사용자 개입 없이 웹앱 스스로 검색하고 AI로 정제합니다.
 */
export const fetchAndOrganizeConferences = async (geminiKey, topics, currentYear) => {
  if (!geminiKey) {
    throw new Error("Gemini API Key가 필요합니다. (AI 정제용)");
  }

  try {
    // 1. Tavily를 통한 실시간 웹 검색
    const searchQuery = `${topics.join(", ")} conferences and seminars in ${currentYear} and future Korea global`;
    console.log("Searching for:", searchQuery);

    const searchResponse = await axios.post("https://api.tavily.com/search", {
      api_key: TAVILY_API_KEY,
      query: searchQuery,
      search_depth: "advanced",
      include_answer: true,
      max_results: 10
    });

    const rawData = searchResponse.data;
    const searchContext = rawData.results.map(r => `${r.title}: ${r.content}`).join("\n\n");

    // 2. Gemini를 통한 AI 데이터 구조화 (브라우저에서 직접 실행)
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a specialized conference data organizer. 
      Below is raw search data about automotive, AI, SDV, and software testing conferences for the year ${currentYear} and future.
      
      TASK: Organize the information into a high-quality JSON array matching this exact schema:
      [{
        "id": number (unique),
        "title": "Clear Event Name",
        "desc": "Short summary (1-2 sentences in Korean)",
        "location": "City, Country or Online",
        "date": "YYYY-MM-DD",
        "type": "domestic" or "global",
        "tags": ["Tag1", "Tag2"],
        "link": "https://..."
      }]

      RULES:
      1. Dates must be YYYY-MM-DD. If exact date is missing, estimate as YYYY-MM-01.
      2. Desc MUST be in Korean (한국어).
      3. Focus on high relevance to SDV, AI, MATLAB, Testing, and SW Engineering.
      4. Deduplicate events.
      5. Output ONLY the JSON array. No markdown, no text.

      SEARCH DATA:
      ${searchContext}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱 (마크다운태그 제거 등)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Conference Service Error:", error);
    throw error;
  }
};
