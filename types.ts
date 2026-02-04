
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
  genderCompetencyScores?: {
    male: Record<string, number>;
    female: Record<string, number>;
  };
  gradeDistribution: Record<number, number>;
  admissionDistribution?: Record<string, number>;
  admissionCompetencyScores?: Record<string, Record<string, number>>;
}

export interface DeptAgg extends AggregatedData {
  deptName: string;
  categoryName?: string;
}

export interface CategoryAgg extends AggregatedData {
  categoryName: string;
  deptCount: number;
}

export interface AppState {
  university: AggregatedData;
  departments: DeptAgg[];
  categories: CategoryAgg[];
  mapping: CompetencyMapping[];
  lastUpdated: string;
}

export type PageView = 'home' | 'dashboard' | 'categoryHub' | 'deptHub' | 'deptDetail' | 'community' | 'admin' | 'aiAnalyst';
