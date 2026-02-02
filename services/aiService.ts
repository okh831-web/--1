import { GoogleGenAI } from "@google/genai";
import { DeptAgg, AggregatedData } from "../types";
import { COMPETENCY_DEFINITIONS } from "../constants";

/**
 * AI Service for academic data analysis using Gemini API.
 * Updated to strictly use defined competency names and prevent hallucinations.
 */

// 공식 역량 구조를 AI가 이해하기 쉬운 텍스트 형식으로 변환
const COMPETENCY_CONTEXT = COMPETENCY_DEFINITIONS.map(c => 
  `- ${c.name}: [하위요소: ${c.subCompetencies.map(s => s.name).join(", ")}]`
).join("\n");

const SUB_COMP_MAP = COMPETENCY_DEFINITIONS.reduce((acc, curr) => {
  curr.subCompetencies.forEach(sub => {
    acc[sub.id] = sub.name;
  });
  return acc;
}, {} as Record<string, string>);

export const generateDeptReport = async (deptData: DeptAgg, univData: AggregatedData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  // 하위역량 점수를 ID 대신 실제 명칭으로 치환하여 AI에게 전달
  const namedSubScores = Object.entries(deptData.subCompetencyScores).reduce((acc, [id, score]) => {
    acc[SUB_COMP_MAP[id] || id] = score;
    return acc;
  }, {} as Record<string, number>);

  const namedUnivSubScores = Object.entries(univData.subCompetencyScores).reduce((acc, [id, score]) => {
    acc[SUB_COMP_MAP[id] || id] = score;
    return acc;
  }, {} as Record<string, number>);

  const systemInstruction = `
    당신은 건양대학교 교육성과관리 전문 분석가입니다. 
    반드시 다음의 공식 역량 체계 내에서만 분석을 수행하고, 존재하지 않는 명칭(예: 지식탐구, 지역사회공헌 등)을 절대 사용하지 마십시오.

    [건양대학교 공식 6대 핵심역량 및 12개 하위역량]
    ${COMPETENCY_CONTEXT}

    분석 원칙:
    1. 모든 점수는 100점 만점 기준입니다.
    2. 리포트 구성: [학과 요약], [6대 역량 분석], [하위 역량 강약점(TOP 3 / BOTTOM 3)], [교육 제언].
    3. 하위 역량 명칭은 반드시 위에 나열된 명칭(자기이해, 자기효능감 등)을 정확히 사용하십시오.
    4. 대학 전체 평균과 비교하여 상대적인 강점과 약점을 논리적으로 서술하십시오.
  `;

  const prompt = `
    '${deptData.deptName}' 학과 분석 요청:

    [학과 데이터]
    - 참여인원: ${deptData.n}명
    - 6대 역량 점수: ${JSON.stringify(deptData.competencyScores)}
    - 12개 하위역량 명칭별 점수: ${JSON.stringify(namedSubScores)}

    [대학 전체 비교 데이터]
    - 전체 6대 역량 평균: ${JSON.stringify(univData.competencyScores)}
    - 전체 12개 하위역량 평균: ${JSON.stringify(namedUnivSubScores)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // 창의성보다는 정확성을 위해 온도를 낮춤
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Report Generation Error:", error);
    return "리포트 생성 중 오류가 발생했습니다. 정확한 명칭 기반 분석을 위해 시스템을 재점검 중입니다.";
  }
};

export const chatWithAnalyst = async (message: string, allData: { university: AggregatedData, departments: DeptAgg[] }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    당신은 건양대학교 핵심역량 분석 전문 AI 분석가입니다.
    사용자의 요청에 대해 반드시 건양대학교 고유의 역량 체계(자기신뢰, 라이프디자인, 프로페셔널리즘, 창조적도전, 융화적소통, 공동체참여)만을 사용하여 답변하십시오.

    [절대 금기 사항]
    - 시스템에 정의되지 않은 역량 명칭(예: 지식탐구, 지역사회공헌, 문제해결 등)을 창조하여 답변하지 마십시오.
    - 하위 요소는 반드시 [자기이해, 자기효능감, 목표설정, 전략적실행, 전공전문성, 직업윤리, 진취적도전, 성장탄력성, 자기표현, 개방적경청, 공동체이해, 역할행동] 중 데이터와 일치하는 항목만 사용하십시오.

    [답변 가이드]
    - 학과 요청 시 '학과 요약', '역량 분석', '하위 요소 TOP 3', '시사점' 순으로 작성하십시오.
    - 대학 전체 평균(${JSON.stringify(allData.university.competencyScores)})을 기준으로 분석하십시오.
  `;

  const prompt = `사용자 요청: ${message}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        systemInstruction,
        temperature: 0.2 
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Chat Analytic Error:", error);
    return "요청하신 분석 수행 중 정합성 오류가 발생했습니다. 공식 역량 체계에 맞춰 다시 분석을 준비 중입니다.";
  }
};