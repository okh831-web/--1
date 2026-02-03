
import * as XLSX from 'xlsx';
import { AggregatedData, DeptAgg, CategoryAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';

/**
 * 건양대학교 2026 공식 계열 분류 체계 (이미지 기반)
 */
export const detectCategory = (deptName: string): string => {
  const d = deptName;
  if (d.includes('디지털콘텐츠') || d.includes('인공지능') || d.includes('컴퓨터') || d.includes('사이버보안') || d.includes('융합IT')) return 'AI·SW융합대학';
  if (d.includes('간호')) return '간호대학';
  if (d.includes('군사') || d.includes('경찰')) return '군사경찰계열';
  if (d.includes('경영') || d.includes('글로벌') || d.includes('금융') || d.includes('세무')) return '글로벌경영계열';
  if (d.includes('의예') || d.includes('의학') || d.includes('임상병리') || d.includes('방사선') || d.includes('치위생')) return '의과학계열';
  if (d.includes('의료공학') || d.includes('제약공학') || d.includes('의료IT')) return '의료공과계열';
  if (d.includes('물리치료') || d.includes('작업치료') || d.includes('언어치료') || d.includes('사회복지') || d.includes('아동보육') || d.includes('안경광학')) return '재활복지계열';
  if (d.includes('문화산업') || d.includes('유아교육') || d.includes('초등특수') || d.includes('심리')) return '창의융합계열';
  return '기타창의계열';
};

/**
 * 학과 리스트를 바탕으로 계열별 데이터를 정확하게 집계하는 함수
 */
export const aggregateCategories = (depts: DeptAgg[]): CategoryAgg[] => {
  const categoriesList = ['AI·SW융합대학', '간호대학', '군사경찰계열', '글로벌경영계열', '의과학계열', '의료공과계열', '재활복지계열', '창의융합계열', '기타창의계열'];
  
  const catMap: Record<string, DeptAgg[]> = {};
  depts.forEach(d => {
    const catName = d.categoryName || detectCategory(d.deptName);
    if (!catMap[catName]) catMap[catName] = [];
    catMap[catName].push(d);
  });

  return categoriesList.map(catName => {
    const subDepts = catMap[catName] || [];
    const totalN = subDepts.reduce((s, d) => s + d.n, 0);
    
    // 점수는 인원수에 따른 가중 평균으로 계산
    const catCompScores: any = {};
    COMPETENCY_DEFINITIONS.forEach(c => {
      if (totalN > 0) {
        catCompScores[c.id] = parseFloat((subDepts.reduce((s, d) => s + (d.competencyScores[c.id] * d.n), 0) / totalN).toFixed(1));
      } else {
        catCompScores[c.id] = 0;
      }
    });

    const genderDist = { 
      male: subDepts.reduce((s, d) => s + d.genderDistribution.male, 0),
      female: subDepts.reduce((s, d) => s + d.genderDistribution.female, 0),
      unknown: subDepts.reduce((s, d) => s + d.genderDistribution.unknown, 0)
    };

    const gradeDist = {
      1: subDepts.reduce((s, d) => s + d.gradeDistribution[1], 0),
      2: subDepts.reduce((s, d) => s + d.gradeDistribution[2], 0),
      3: subDepts.reduce((s, d) => s + d.gradeDistribution[3], 0),
      4: subDepts.reduce((s, d) => s + d.gradeDistribution[4], 0),
    };

    return {
      categoryName: catName,
      deptCount: subDepts.length,
      n: totalN,
      updatedAt: subDepts.length > 0 ? subDepts[0].updatedAt : '',
      isSample: subDepts.every(d => d.isSample),
      competencyScores: catCompScores,
      subCompetencyScores: {}, // 요약 데이터
      genderDistribution: genderDist,
      gradeDistribution: gradeDist
    };
  }).filter(cat => cat.n > 0 || cat.categoryName !== '기타창의계열'); // 데이터가 있는 계열만 노출하되 공식 계열은 유지
};

export const downloadSampleExcel = () => {
  const headers = ['학과', '성별', '학년', ...Array.from({ length: 60 }, (_, i) => `문항 ${ i + 1 }`)];
  const sampleData = [
    ['인공지능학과', '남', '1', ...Array.from({ length: 60 }, () => (Math.random() * 2 + 3.5).toFixed(1))],
    ['간호학과', '여', '2', ...Array.from({ length: 60 }, () => (Math.random() * 2 + 3.8).toFixed(1))],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, "건양대_핵심역량_진단_양식.xlsx");
};

export const exportToJson = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getNormalizedKey = (rawKey: string): string => {
  if (!rawKey) return '';
  const cleanKey = String(rawKey).replace(/^\uFEFF/, '').replace(/\s+/g, '').toLowerCase();
  if (cleanKey.includes('학과') || cleanKey.includes('전공') || cleanKey.includes('dept')) return '학과';
  if (cleanKey.includes('성별') || cleanKey.includes('gender') || cleanKey === 'sex') return '성별';
  if (cleanKey.includes('학년') || cleanKey.includes('grade')) return '학년';
  const match = cleanKey.match(/(?:문항|q|question|v|item|no|n)?(\d+)/i);
  if (match) return `문항${match[1]}`;
  return cleanKey;
};

const parseGender = (val: any): 'male' | 'female' | 'unknown' => {
  if (!val) return 'unknown';
  const s = String(val).trim().toLowerCase();
  if (['1', '남', '남성', 'm', 'male'].includes(s)) return 'male';
  if (['2', '여', '여성', 'f', 'female'].includes(s)) return 'female';
  return 'unknown';
};

export const processExcelFile = async (file: File): Promise<{ university: AggregatedData; departments: DeptAgg[]; categories: CategoryAgg[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rawRows.length === 0) throw new Error('파일에 데이터가 없습니다.');

        const normalizedRows = rawRows.map(row => {
          const newRow: any = {};
          for (const key in row) { newRow[getNormalizedKey(key)] = row[key]; }
          return newRow;
        });

        const deptMap: Record<string, any[]> = {};
        normalizedRows.forEach(row => {
          const deptName = String(row['학과'] || '미분류 학과').trim(); 
          if (!deptMap[deptName]) deptMap[deptName] = [];
          deptMap[deptName].push(row);
        });

        const aggregateRows = (dataRows: any[]): AggregatedData => {
          const n = dataRows.length;
          const genderDist = { male: 0, female: 0, unknown: 0 };
          const gradeDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
          const compSums: Record<string, number> = {};
          const subCompSums: Record<string, number> = {};
          const genderCompSums: any = { male: {}, female: {} };

          COMPETENCY_DEFINITIONS.forEach(c => {
            compSums[c.id] = 0;
            genderCompSums.male[c.id] = 0;
            genderCompSums.female[c.id] = 0;
            c.subCompetencies.forEach(s => subCompSums[s.id] = 0);
          });

          dataRows.forEach(row => {
            const gk = parseGender(row['성별']);
            genderDist[gk]++;
            const gr = parseInt(row['학년']) || 1;
            if (gr >= 1 && gr <= 4) gradeDist[gr]++;

            COMPETENCY_DEFINITIONS.forEach(comp => {
              let cSum = 0; let cCnt = 0;
              comp.questions.forEach(q => {
                const valRaw = row[`문항${q}`];
                if (valRaw !== undefined && valRaw !== null) {
                   const val = parseFloat(String(valRaw));
                   if (!isNaN(val)) { cSum += (val <= 5 ? val * 20 : val); cCnt++; }
                }
              });
              const avg = cCnt > 0 ? cSum / cCnt : 0;
              compSums[comp.id] += avg;
              if (gk !== 'unknown') genderCompSums[gk][comp.id] += avg;
              
              comp.subCompetencies.forEach(sub => {
                let sSum = 0; let sCnt = 0;
                sub.questions.forEach(q => {
                  const vRaw = row[`문항${q}`];
                  if (vRaw !== undefined && vRaw !== null) {
                    const val = parseFloat(String(vRaw));
                    if (!isNaN(val)) { sSum += (val <= 5 ? val * 20 : val); sCnt++; }
                  }
                });
                subCompSums[sub.id] += (sCnt > 0 ? sSum / sCnt : 0);
              });
            });
          });

          const competencyScores: any = {};
          const subCompetencyScores: any = {};
          const genderCompetencyScores: any = { male: {}, female: {} };

          COMPETENCY_DEFINITIONS.forEach(comp => {
            competencyScores[comp.id] = parseFloat((compSums[comp.id] / n).toFixed(2)) || 0;
            genderCompetencyScores.male[comp.id] = genderDist.male > 0 ? parseFloat((genderCompSums.male[comp.id] / genderDist.male).toFixed(2)) : 0;
            genderCompetencyScores.female[comp.id] = genderDist.female > 0 ? parseFloat((genderCompSums.female[comp.id] / genderDist.female).toFixed(2)) : 0;
            comp.subCompetencies.forEach(sub => {
              subCompetencyScores[sub.id] = parseFloat((subCompSums[sub.id] / n).toFixed(2)) || 0;
            });
          });

          return { n, updatedAt: new Date().toISOString().split('T')[0], isSample: false, competencyScores, subCompetencyScores, genderDistribution: genderDist, genderCompetencyScores, gradeDistribution: gradeDist };
        };

        const universityAgg = aggregateRows(normalizedRows);
        const deptAggs: DeptAgg[] = Object.entries(deptMap).map(([name, data]) => ({
          ...aggregateRows(data),
          deptName: name,
          categoryName: detectCategory(name)
        }));

        const catAggs = aggregateCategories(deptAggs);

        resolve({ university: universityAgg, departments: deptAggs, categories: catAggs });
      } catch (err: any) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
};
