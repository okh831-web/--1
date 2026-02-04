
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { AggregatedData, DeptAgg, CategoryAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';

/**
 * 건양대학교 2026 공식 계열 분류 체계
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
 * 전형명 정규화
 */
export const normalizeAdmissionType = (val: any): string => {
  if (!val) return '기타/미분류';
  const s = String(val).trim();
  if (s.includes('교과')) return '학생부교과';
  if (s.includes('종합')) return '학생부종합';
  if (s.includes('수능') || s.includes('정시')) return '수능(정시)';
  if (s.includes('실기')) return '실기/실적';
  if (s.includes('외국인')) return '재외국인';
  return '기타/미분류';
};

/**
 * 계열별 집계
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
    
    const catCompScores: any = {};
    COMPETENCY_DEFINITIONS.forEach(c => {
      catCompScores[c.id] = totalN > 0 
        ? parseFloat((subDepts.reduce((s, d) => s + (d.competencyScores[c.id] * d.n), 0) / totalN).toFixed(1))
        : 0;
    });

    const genderDist = { 
      male: subDepts.reduce((s, d) => s + (d.genderDistribution?.male || 0), 0),
      female: subDepts.reduce((s, d) => s + (d.genderDistribution?.female || 0), 0),
      unknown: subDepts.reduce((s, d) => s + (d.genderDistribution?.unknown || 0), 0)
    };

    const genderCompScores: any = { male: {}, female: {} };
    COMPETENCY_DEFINITIONS.forEach(c => {
      genderCompScores.male[c.id] = genderDist.male > 0 
        ? parseFloat((subDepts.reduce((s, d) => s + ((d.genderCompetencyScores?.male?.[c.id] || 0) * (d.genderDistribution?.male || 0)), 0) / genderDist.male).toFixed(1))
        : 0;
      genderCompScores.female[c.id] = genderDist.female > 0 
        ? parseFloat((subDepts.reduce((s, d) => s + ((d.genderCompetencyScores?.female?.[c.id] || 0) * (d.genderDistribution?.female || 0)), 0) / genderDist.female).toFixed(1))
        : 0;
    });

    return {
      categoryName: catName,
      deptCount: subDepts.length,
      n: totalN,
      updatedAt: subDepts.length > 0 ? subDepts[0].updatedAt : '',
      isSample: subDepts.every(d => d.isSample),
      competencyScores: catCompScores,
      subCompetencyScores: {}, 
      genderDistribution: genderDist,
      genderCompetencyScores: genderCompScores,
      gradeDistribution: {
        1: subDepts.reduce((s, d) => s + (d.gradeDistribution?.[1] || 0), 0),
        2: subDepts.reduce((s, d) => s + (d.gradeDistribution?.[2] || 0), 0),
        3: subDepts.reduce((s, d) => s + (d.gradeDistribution?.[3] || 0), 0),
        4: subDepts.reduce((s, d) => s + (d.gradeDistribution?.[4] || 0), 0),
      }
    };
  }).filter(cat => cat.n > 0 || cat.categoryName !== '기타창의계열'); 
};

export const parseGender = (val: any): 'male' | 'female' | 'unknown' => {
  if (val === undefined || val === null) return 'unknown';
  const s = String(val).trim().toLowerCase();
  if (['1', '남', '남성', '남자', 'm', 'male'].includes(s)) return 'male';
  if (['2', '여', '여성', '여자', 'f', 'female'].includes(s)) return 'female';
  return 'unknown';
};

const aggregateRows = (dataRows: any[]): AggregatedData => {
  const n = dataRows.length;
  const genderDist = { male: 0, female: 0, unknown: 0 };
  const gradeDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const admissionDist: Record<string, number> = {};
  
  const compSums: Record<string, number> = {};
  const subCompSums: Record<string, number> = {};
  const genderCompSums: any = { male: {}, female: {} };
  const admissionCompSums: Record<string, Record<string, number>> = {};

  COMPETENCY_DEFINITIONS.forEach(c => {
    compSums[c.id] = 0;
    genderCompSums.male[c.id] = 0;
    genderCompSums.female[c.id] = 0;
    c.subCompetencies.forEach(sub => {
      subCompSums[sub.id] = 0;
    });
  });

  dataRows.forEach(row => {
    const gk = parseGender(row['성별']);
    genderDist[gk]++;
    const gr = parseInt(row['학년']) || 1;
    if (gr >= 1 && gr <= 4) gradeDist[gr]++;
    const adm = normalizeAdmissionType(row['모집전형']);
    admissionDist[adm] = (admissionDist[adm] || 0) + 1;
    if (!admissionCompSums[adm]) {
      admissionCompSums[adm] = {};
      COMPETENCY_DEFINITIONS.forEach(c => admissionCompSums[adm][c.id] = 0);
    }

    COMPETENCY_DEFINITIONS.forEach(comp => {
      let cSum = 0; let cCnt = 0;
      comp.subCompetencies.forEach(sub => {
        let sSum = 0; let sCnt = 0;
        sub.questions.forEach(q => {
          const valRaw = row[`문항${q}`];
          if (valRaw !== undefined && valRaw !== null) {
            const val = parseFloat(String(valRaw));
            if (!isNaN(val)) {
              const score = (val <= 5 ? val * 20 : val);
              sSum += score; sCnt++;
              cSum += score; cCnt++;
            }
          }
        });
        const subAvg = sCnt > 0 ? sSum / sCnt : 0;
        subCompSums[sub.id] += subAvg;
      });
      const avg = cCnt > 0 ? cSum / cCnt : 0;
      compSums[comp.id] += avg;
      if (gk !== 'unknown') genderCompSums[gk][comp.id] += avg;
      admissionCompSums[adm][comp.id] += avg;
    });
  });

  const competencyScores: any = {};
  const subCompetencyScores: any = {};
  const genderCompetencyScores: any = { male: {}, female: {} };
  const admissionCompetencyScores: Record<string, Record<string, number>> = {};

  COMPETENCY_DEFINITIONS.forEach(comp => {
    competencyScores[comp.id] = n > 0 ? parseFloat((compSums[comp.id] / n).toFixed(2)) : 0;
    genderCompetencyScores.male[comp.id] = genderDist.male > 0 ? parseFloat((genderCompSums.male[comp.id] / genderDist.male).toFixed(2)) : 0;
    genderCompetencyScores.female[comp.id] = genderDist.female > 0 ? parseFloat((genderCompSums.female[comp.id] / genderDist.female).toFixed(2)) : 0;
    
    comp.subCompetencies.forEach(sub => {
      subCompetencyScores[sub.id] = n > 0 ? parseFloat((subCompSums[sub.id] / n).toFixed(2)) : 0;
    });

    Object.keys(admissionDist).forEach(adm => {
      if (!admissionCompetencyScores[adm]) admissionCompetencyScores[adm] = {};
      admissionCompetencyScores[adm][comp.id] = parseFloat((admissionCompSums[adm][comp.id] / admissionDist[adm]).toFixed(2));
    });
  });

  return { 
    n, 
    updatedAt: new Date().toISOString().split('T')[0], 
    isSample: false, 
    competencyScores, 
    subCompetencyScores, 
    genderDistribution: genderDist, 
    genderCompetencyScores, 
    gradeDistribution: gradeDist,
    admissionDistribution: admissionDist,
    admissionCompetencyScores
  };
};

const aggregateAllRows = (normalizedRows: any[]): { university: AggregatedData; departments: DeptAgg[]; categories: CategoryAgg[] } => {
  const deptMap: Record<string, any[]> = {};
  normalizedRows.forEach(row => {
    const deptName = String(row['학과'] || '미분류 학과').trim(); 
    if (!deptMap[deptName]) deptMap[deptName] = [];
    deptMap[deptName].push(row);
  });

  const universityAgg = aggregateRows(normalizedRows);
  const deptAggs: DeptAgg[] = Object.entries(deptMap).map(([name, data]) => ({
    ...aggregateRows(data),
    deptName: name,
    categoryName: detectCategory(name)
  }));

  const catAggs = aggregateCategories(deptAggs);
  return { university: universityAgg, departments: deptAggs, categories: catAggs };
};

const getRowsFromBuffer = (buffer: ArrayBuffer): any[] => {
  const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet) as any[];
  return rawRows.map(row => {
    const newRow: any = {};
    for (const key in row) { newRow[getNormalizedKey(key)] = row[key]; }
    return newRow;
  });
};

const getNormalizedKey = (rawKey: string): string => {
  if (!rawKey) return '';
  const cleanKey = String(rawKey).replace(/^\uFEFF/, '').replace(/\s+/g, '').toLowerCase();
  if (cleanKey.includes('학과') || cleanKey.includes('전공') || cleanKey.includes('dept')) return '학과';
  if (cleanKey.includes('성별') || cleanKey.includes('gender') || cleanKey === 'sex' || cleanKey === '성') return '성별';
  if (cleanKey.includes('학년') || cleanKey.includes('grade')) return '학년';
  if (cleanKey.includes('전형') || cleanKey.includes('모집') || cleanKey.includes('admission')) return '모집전형';
  const match = cleanKey.match(/(?:문항|q|question|v|item|no|n)?(\d+)/i);
  if (match) return `문항${match[1]}`;
  return cleanKey;
};

export const processExcelFile = async (file: File): Promise<{ university: AggregatedData; departments: DeptAgg[]; categories: CategoryAgg[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        if (file.name.toLowerCase().endsWith('.zip')) {
          const zip = await JSZip.loadAsync(data);
          let combinedRows: any[] = [];
          const filePromises: Promise<void>[] = [];
          zip.forEach((relativePath, zipEntry) => {
            const ext = relativePath.toLowerCase();
            if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv')) {
              filePromises.push(zipEntry.async('arraybuffer').then(content => {
                const rows = getRowsFromBuffer(content);
                combinedRows = [...combinedRows, ...rows];
              }));
            }
          });
          await Promise.all(filePromises);
          resolve(aggregateAllRows(combinedRows));
        } else {
          const rows = getRowsFromBuffer(data);
          resolve(aggregateAllRows(rows));
        }
      } catch (err: any) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const downloadSampleExcel = () => {
  const headers = ['학과', '성별', '학년', '모집전형', ...Array.from({ length: 60 }, (_, i) => `문항 ${ i + 1 }`)];
  const sampleData = [
    ['인공지능학과', '남성', '1', '학생부교과', ...Array.from({ length: 60 }, () => (Math.random() * 2 + 3.5).toFixed(1))],
    ['간호학과', '여성', '2', '학생부종합', ...Array.from({ length: 60 }, () => (Math.random() * 2 + 3.8).toFixed(1))],
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
