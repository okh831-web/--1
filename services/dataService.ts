
import * as XLSX from 'xlsx';
import { AggregatedData, DeptAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';

export const downloadSampleExcel = () => {
  const headers = ['학과', '성별', '학년', ...Array.from({ length: 60 }, (_, i) => `문항 ${i + 1}`)];
  const sampleData = [
    ['K-문화산업학과', '남', '1', ...Array.from({ length: 60 }, () => (Math.random() * 20 + 80).toFixed(1))],
    ['간호학과', '여', '2', ...Array.from({ length: 60 }, () => (Math.random() * 20 + 75).toFixed(1))],
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

/**
 * 엑셀 헤더 명칭을 시스템 표준 키로 변환 (Fuzzy Matching)
 */
const getNormalizedKey = (rawKey: string): string => {
  if (!rawKey) return '';
  const cleanKey = String(rawKey).replace(/^\uFEFF/, '').replace(/\s+/g, '').toLowerCase();
  
  if (cleanKey.includes('학과') || cleanKey === 'dept' || cleanKey.includes('부서')) return '학과';
  if (cleanKey.includes('성별') || cleanKey === 'gender' || cleanKey === 'sex' || cleanKey.includes('남/여')) return '성별';
  if (cleanKey.includes('학년') || cleanKey === 'grade' || cleanKey.includes('연차')) return '학년';
  
  // 문항 번호 추출 (문항1, q1, Q1, 1번문항 등 대응)
  const match = cleanKey.match(/(?:문항|q|question|v|item)?(\d+)/i);
  if (match) return `문항${match[1]}`;
  
  return cleanKey;
};

/**
 * 성별 값을 남/여/미분류로 정확히 판별
 */
const parseGender = (val: any): 'male' | 'female' | 'unknown' => {
  if (val === undefined || val === null) return 'unknown';
  const s = String(val).trim().toLowerCase();
  if (['1', '남', '남성', 'm', 'male', 'man'].includes(s)) return 'male';
  if (['2', '여', '여성', 'f', 'female', 'woman'].includes(s)) return 'female';
  return 'unknown';
};

export const processExcelFile = async (file: File): Promise<{ university: AggregatedData; departments: DeptAgg[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rawRows.length === 0) throw new Error('엑셀 파일에 데이터가 없습니다.');

        // 모든 로우의 키를 정규화하여 데이터 정합성 확보
        const normalizedRows = rawRows.map(row => {
          const newRow: any = {};
          for (const key in row) {
            newRow[getNormalizedKey(key)] = row[key];
          }
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
          const genderCompSums: { male: Record<string, number>, female: Record<string, number> } = { 
            male: {}, 
            female: {} 
          };

          // 초기화 (누락 방지)
          COMPETENCY_DEFINITIONS.forEach(c => {
            compSums[c.id] = 0;
            genderCompSums.male[c.id] = 0;
            genderCompSums.female[c.id] = 0;
            c.subCompetencies.forEach(s => subCompSums[s.id] = 0);
          });

          dataRows.forEach(row => {
            const genderKey = parseGender(row['성별']);
            genderDist[genderKey]++;

            const grade = parseInt(row['학년']) || 1;
            if (grade >= 1 && grade <= 4) gradeDist[grade]++;

            COMPETENCY_DEFINITIONS.forEach(comp => {
              let compTotalInRow = 0;
              let compCountInRow = 0;
              
              comp.questions.forEach(qNum => {
                const valRaw = row[`문항${qNum}`];
                if (valRaw !== undefined && valRaw !== null) {
                  const val = parseFloat(String(valRaw).replace(/,/g, '.'));
                  if (!isNaN(val)) {
                    // 5점 척도 자동 감지 및 100점 환산
                    const score = (val <= 5 && val > 0) ? val * 20 : val;
                    compTotalInRow += score;
                    compCountInRow++;
                  }
                }
              });
              
              const rowCompAvg = compCountInRow > 0 ? (compTotalInRow / compCountInRow) : 0;
              compSums[comp.id] += rowCompAvg;

              if (genderKey !== 'unknown') {
                genderCompSums[genderKey][comp.id] += rowCompAvg;
              }

              comp.subCompetencies.forEach(sub => {
                let subTotalInRow = 0;
                let subCountInRow = 0;
                sub.questions.forEach(qNum => {
                  const valRaw = row[`문항${qNum}`];
                  if (valRaw !== undefined && valRaw !== null) {
                    const val = parseFloat(String(valRaw).replace(/,/g, '.'));
                    if (!isNaN(val)) {
                      const score = (val <= 5 && val > 0) ? val * 20 : val;
                      subTotalInRow += score;
                      subCountInRow++;
                    }
                  }
                });
                const rowSubAvg = subCountInRow > 0 ? (subTotalInRow / subCountInRow) : 0;
                subCompSums[sub.id] += rowSubAvg;
              });
            });
          });

          const competencyScores: Record<string, number> = {};
          const subCompetencyScores: Record<string, number> = {};
          const genderCompetencyScores = {
            male: {} as Record<string, number>,
            female: {} as Record<string, number>
          };

          COMPETENCY_DEFINITIONS.forEach(comp => {
            competencyScores[comp.id] = parseFloat((compSums[comp.id] / n).toFixed(2)) || 0;
            
            // 성별 평균 계산 (분모가 0인 경우 0점 처리하여 객체 구조 유지)
            genderCompetencyScores.male[comp.id] = genderDist.male > 0 
              ? parseFloat((genderCompSums.male[comp.id] / genderDist.male).toFixed(2)) 
              : 0;
            genderCompetencyScores.female[comp.id] = genderDist.female > 0 
              ? parseFloat((genderCompSums.female[comp.id] / genderDist.female).toFixed(2)) 
              : 0;

            comp.subCompetencies.forEach(sub => {
              subCompetencyScores[sub.id] = parseFloat((subCompSums[sub.id] / n).toFixed(2)) || 0;
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
          };
        };

        const universityAgg = aggregateRows(normalizedRows);
        const deptAggs: DeptAgg[] = Object.entries(deptMap).map(([name, data]) => ({
          ...aggregateRows(data),
          deptName: name,
        }));

        resolve({ university: universityAgg, departments: deptAggs });
      } catch (err: any) {
        reject(new Error(`파일 분석 오류: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
    reader.readAsBinaryString(file);
  });
};
