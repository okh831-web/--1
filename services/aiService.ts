
import { GoogleGenAI } from "@google/genai";
import { DeptAgg, AggregatedData } from "../types";

// API Key가 없을 경우를 대비한 안전한 인스턴스 생성 함수
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key가 설정되지 않았습니다. AI 기능을 사용할 수 없습니다.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

const ai = getAIInstance();

export const generateDeptReport = async (deptData: DeptAgg, univData: AggregatedData) => {
  if (!process.env.API_KEY) return "시스템 설정에서 API Key가 누락되었습니다.";

  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    당신은 대학 교육성과관리 전문 데이터 분석가입니다. 
    건양대학교 핵심역량 진단 데이터를 바탕으로 학과 교수님들을 위한 고도화된 리포트를 작성하십시오.
    데이터 수치 환산 기준: 모든 문항(1~5점)은 100점 만점으로 환산(점수 * 20)되어 있습니다.

    리포트는 반드시 다음 구성을 따르십시오:
    - [학과 요약]: 응시 인원, 6대 역량 평점 평균, 전형별/학년별 데이터 기반 특이사항 요약.
    - [역량 분석]: 6대 역량 점수를 기술하고, 대학 전체 평균(Base) 대비 해당 학과의 우수 영역 및 집중 관리 영역 분석.
    - [하위 역량]: 12개 하위 역량 중 학과 강점 TOP 3와 약점 TOP 3를 구체적 수치와 함께 추출.
    - [시사점]: 분석가로서 해당 학과 교수님들께 드리는 교육과정 개선 제언 및 학생 지도 방향성 제시.

    말투는 신뢰감 있고 전문적이어야 하며, 학술적 분석 보고서 형식을 유지하십시오.
  `;

  const prompt = `
    다음은 '${deptData.deptName}' 학과의 상세 데이터입니다. 대학 전체 지표와 대조하여 전문 리포트를 생성하십시오.

    [학과 기초 정보]
    - 학과명: ${deptData.deptName}
    - 총 응시 인원: ${deptData.n}명
    - 학년 분포: ${JSON.stringify(deptData.gradeDistribution)}
    - 성별 분포: ${JSON.stringify(deptData.genderDistribution)}

    [학과 역량 데이터 (100점 환산값)]
    - 6대 핵심역량: ${JSON.stringify(deptData.competencyScores)}
    - 12대 하위역량: ${JSON.stringify(deptData.subCompetencyScores)}

    [대학 전체 비교 기준]
    - 전체 6대 역량 평균: ${JSON.stringify(univData.competencyScores)}
    - 전체 12대 하위역량 평균: ${JSON.stringify(univData.subCompetencyScores)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Report Generation Error:", error);
    return "리포트 생성 중 오류가 발생했습니다. 학과 데이터 형식을 확인해 주세요.";
  }
};

export const chatWithAnalyst = async (message: string, allData: { university: AggregatedData, departments: DeptAgg[] }) => {
  if (!process.env.API_KEY) return "AI 분석 기능을 사용하려면 API Key 설정이 필요합니다.";

  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    당신은 건양대학교 핵심역량 분석 전문 AI 분석가입니다.
    사용자가 "OO학과 분석해줘"라고 요청하면, 제공된 학과 목록에서 해당 학과를 찾아 '학과 요약', '역량 분석', '하위 역량 TOP 3', '시사점' 순으로 리포트를 작성하십시오.
    
    데이터 활용 가이드:
    1. 사용자가 언급한 학과가 전체 학과 목록(${allData.departments.map(d => d.deptName).join(", ")})에 있는지 확인하십시오.
    2. 데이터가 있다면 즉시 리포트 구성을 시작하십시오.
    3. 데이터가 없다면 유사한 이름의 학과를 제안하거나 목록에 있는 학과명을 알려주십시오.
    4. 분석 시 항상 대학 전체 평균(${JSON.stringify(allData.university.competencyScores)})을 기준으로 상대적 비교를 수행하십시오.
  `;

  const prompt = `사용자 요청: ${message}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        systemInstruction,
        temperature: 0.4 
      },
    });
    return response.text;
  } catch (error) {
    return "요청하신 분석을 수행하는 중 기술적인 문제가 발생했습니다. 관리자에게 문의하세요.";
  }
};
