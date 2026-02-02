
import { CompetencyMapping, AggregatedData, DeptAgg } from './types';

export const UNIVERSITY_COLORS = {
  navy: '#003478',
  green: '#009640',
  lightNavy: '#1e4b8f',
  lightGreen: '#34a853',
};

export const COMPETENCY_DEFINITIONS: CompetencyMapping[] = [
  {
    id: 'selfConfidence',
    name: '자기신뢰',
    questions: Array.from({ length: 10 }, (_, i) => i + 1),
    subCompetencies: [
      { id: 'sub1', name: '자기이해', questions: [1, 2, 3, 4, 5] },
      { id: 'sub2', name: '자기효능감', questions: [6, 7, 8, 9, 10] },
    ],
  },
  {
    id: 'lifeDesign',
    name: '라이프디자인',
    questions: Array.from({ length: 10 }, (_, i) => i + 11),
    subCompetencies: [
      { id: 'sub3', name: '목표설정', questions: [11, 12, 13, 14, 15] },
      { id: 'sub4', name: '전략적실행', questions: [16, 17, 18, 19, 20] },
    ],
  },
  {
    id: 'professionalism',
    name: '프로페셔널리즘',
    questions: Array.from({ length: 10 }, (_, i) => i + 21),
    subCompetencies: [
      { id: 'sub5', name: '전공전문성', questions: [21, 22, 23, 24, 25] },
      { id: 'sub6', name: '직업윤리', questions: [26, 27, 28, 29, 30] },
    ],
  },
  {
    id: 'creativeChallenge',
    name: '창조적도전',
    questions: Array.from({ length: 10 }, (_, i) => i + 31),
    subCompetencies: [
      { id: 'sub7', name: '진취적도전', questions: [31, 32, 33, 34, 35] },
      { id: 'sub8', name: '성장탄력성', questions: [36, 37, 38, 39, 40] },
    ],
  },
  {
    id: 'convergenceComm',
    name: '융화적소통',
    questions: Array.from({ length: 10 }, (_, i) => i + 41),
    subCompetencies: [
      { id: 'sub9', name: '자기표현', questions: [41, 42, 43, 44, 45] },
      { id: 'sub10', name: '개방적경청', questions: [46, 47, 48, 49, 50] },
    ],
  },
  {
    id: 'communityParticipation',
    name: '공동체참여',
    questions: Array.from({ length: 10 }, (_, i) => i + 51),
    subCompetencies: [
      { id: 'sub11', name: '공동체이해', questions: [51, 52, 53, 54, 55] },
      { id: 'sub12', name: '역할행동', questions: [56, 57, 58, 59, 60] },
    ],
  },
];

export const INITIAL_UNIVERSITY_DATA: AggregatedData = {
  n: 5240,
  updatedAt: '2025-08-07',
  isSample: true,
  competencyScores: {
    selfConfidence: 77.2,
    lifeDesign: 78.4,
    professionalism: 76.3,
    creativeChallenge: 73.6,
    convergenceComm: 79.9,
    communityParticipation: 78.0,
  },
  subCompetencyScores: {
    sub1: 76.5, sub2: 77.9, sub3: 79.0, sub4: 77.8, sub5: 75.2, sub6: 77.4,
    sub7: 74.1, sub8: 73.1, sub9: 80.5, sub10: 79.3, sub11: 78.2, sub12: 77.8,
  },
  genderDistribution: { male: 2420, female: 2750, unknown: 70 },
  gradeDistribution: { 1: 1540, 2: 1320, 3: 1210, 4: 1170 },
};

// 헬퍼 함수: 기초 데이터를 바탕으로 편차가 적용된 학과 데이터 생성
const createDept = (name: string, n: number, bonus: Partial<Record<keyof typeof INITIAL_UNIVERSITY_DATA.competencyScores, number>>): DeptAgg => {
  const compScores = { ...INITIAL_UNIVERSITY_DATA.competencyScores };
  const subCompScores = { ...INITIAL_UNIVERSITY_DATA.subCompetencyScores };

  Object.entries(bonus).forEach(([key, val]) => {
    if (compScores[key]) compScores[key] = parseFloat((compScores[key] + (val || 0)).toFixed(1));
  });

  return {
    ...INITIAL_UNIVERSITY_DATA,
    deptName: name,
    n,
    isSample: true,
    competencyScores: compScores,
    subCompetencyScores: subCompScores,
  };
};

export const INITIAL_DEPT_DATA: DeptAgg[] = [
  // 의과대학 & 간호대학
  createDept('의예과', 115, { selfConfidence: 5.2, professionalism: 4.1 }),
  createDept('의학과', 98, { professionalism: 6.5, lifeDesign: 2.1 }),
  createDept('간호학과', 245, { professionalism: 7.2, convergenceComm: 3.5 }),
  
  // 의과학대학
  createDept('임상병리학과', 120, { professionalism: 3.2 }),
  createDept('방사선학과', 110, { professionalism: 2.8 }),
  createDept('치위생학과', 85, { professionalism: 4.5, convergenceComm: 2.1 }),
  createDept('물리치료학과', 95, { professionalism: 5.1, convergenceComm: 1.5 }),
  createDept('작업치료학과', 70, { professionalism: 4.2, communityParticipation: 3.0 }),
  createDept('안경광학과', 60, { professionalism: 2.5 }),
  createDept('응급구조학과', 80, { selfConfidence: 4.8, communityParticipation: 5.5 }),
  createDept('제약공학과', 75, { professionalism: 3.8, creativeChallenge: 2.5 }),
  createDept('의료IT공학과', 90, { creativeChallenge: 5.2, lifeDesign: 1.5 }),
  createDept('의료기기설계및융합과', 65, { creativeChallenge: 6.1 }),
  createDept('의료경영학과', 110, { lifeDesign: 4.5, convergenceComm: 3.2 }),
  createDept('식품영양학과', 80, { professionalism: 3.0, communityParticipation: 2.1 }),
  
  // 창의융합대학
  createDept('디지털콘텐츠학과', 130, { creativeChallenge: 8.5, lifeDesign: 2.0 }),
  createDept('시각디자인학과', 95, { creativeChallenge: 9.2, convergenceComm: 1.8 }),
  createDept('인테리어디자인학과', 75, { creativeChallenge: 6.5 }),
  createDept('융합디자인학과', 88, { creativeChallenge: 7.8, convergenceComm: 2.5 }),
  createDept('인공지능학과', 105, { creativeChallenge: 10.5, lifeDesign: 3.2 }),
  createDept('스마트보안학과', 78, { professionalism: 4.5, creativeChallenge: 5.5 }),
  createDept('의약바이오학과', 82, { professionalism: 5.2, creativeChallenge: 4.1 }),
  
  // 재활복지교육대학
  createDept('유아교육과', 110, { convergenceComm: 6.5, communityParticipation: 4.2 }),
  createDept('초등특수교육과', 65, { convergenceComm: 7.2, communityParticipation: 5.8 }),
  createDept('중등특수교육과', 60, { convergenceComm: 6.8, communityParticipation: 5.2 }),
  createDept('사회복지학과', 140, { communityParticipation: 9.5, convergenceComm: 5.1 }),
  createDept('노인복지학과', 55, { communityParticipation: 8.2, convergenceComm: 4.5 }),
  createDept('심리상담치료학과', 115, { convergenceComm: 8.5, selfConfidence: 3.2 }),
  createDept('아동보육학과', 72, { communityParticipation: 6.1, convergenceComm: 4.8 }),
  
  // 글로벌경영대학
  createDept('경영학부', 280, { lifeDesign: 6.2, convergenceComm: 4.5 }),
  createDept('금융학과', 105, { professionalism: 5.5, lifeDesign: 4.8 }),
  createDept('호텔관광학부', 160, { convergenceComm: 9.1, selfConfidence: 2.5 }),
  createDept('세무경영학과', 90, { professionalism: 6.8, lifeDesign: 3.5 }),
  createDept('글로벌비즈니스학과', 85, { convergenceComm: 7.5, lifeDesign: 5.2 }),
  
  // 군사과학대학 & 기타
  createDept('군사학과', 120, { selfConfidence: 9.5, communityParticipation: 8.5 }),
  createDept('스포츠건강재활학과', 95, { selfConfidence: 6.8, communityParticipation: 3.5 }),
  createDept('융합행정학과', 110, { communityParticipation: 5.2, lifeDesign: 3.1 }),
  createDept('인천캠퍼스_글로벌경영', 45, { convergenceComm: 3.5 }),
];
