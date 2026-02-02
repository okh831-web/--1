
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
  n: 4822,
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
  genderDistribution: { male: 2150, female: 2600, unknown: 72 },
  gradeDistribution: { 1: 1400, 2: 1200, 3: 1150, 4: 1072 },
};

export const INITIAL_DEPT_DATA: DeptAgg[] = [
  {
    ...INITIAL_UNIVERSITY_DATA,
    deptName: '의예과',
    n: 120,
    isSample: true,
    competencyScores: { ...INITIAL_UNIVERSITY_DATA.competencyScores, selfConfidence: 82.1 },
  },
  {
    ...INITIAL_UNIVERSITY_DATA,
    deptName: '간호학과',
    n: 240,
    isSample: true,
    competencyScores: { ...INITIAL_UNIVERSITY_DATA.competencyScores, professionalism: 85.4 },
  },
  {
    ...INITIAL_UNIVERSITY_DATA,
    deptName: '디자인학과',
    n: 85,
    isSample: true,
    competencyScores: { ...INITIAL_UNIVERSITY_DATA.competencyScores, creativeChallenge: 81.2 },
  },
];
