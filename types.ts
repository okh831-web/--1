
export interface CompetencyMapping {
  id: string;
  name: string;
  questions: number[]; // q1 to q60 indices (1-based)
  subCompetencies: SubCompetencyMapping[];
}

export interface SubCompetencyMapping {
  id: string;
  name: string;
  questions: number[];
}

export interface AggregatedData {
  n: number;
  updatedAt: string;
  isSample: boolean;
  competencyScores: Record<string, number>;
  subCompetencyScores: Record<string, number>;
  genderDistribution: { male: number; female: number; unknown: number };
  gradeDistribution: Record<number, number>;
}

export interface DeptAgg extends AggregatedData {
  deptName: string;
}

export interface AppState {
  university: AggregatedData;
  departments: DeptAgg[];
  mapping: CompetencyMapping[];
  lastUpdated: string;
}

export type PageView = 'home' | 'dashboard' | 'deptHub' | 'deptDetail' | 'community' | 'admin' | 'aiAnalyst';
