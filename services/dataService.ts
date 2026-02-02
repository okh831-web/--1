
import * as XLSX from 'xlsx';
import { AggregatedData, DeptAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';

/**
 * 엑셀 양식 다운로드용 헬퍼
 */
export const downloadSampleExcel = () => {
  const headers = ['학과', '성별', '학년', ...Array.from({ length: 60 }, (_, i) => `문항 ${i + 1}`)];
  const sampleData = [
    ['K-문화산업학과', '1', '1', ...Array.from({ length: 60 }, () => (Math.random() * 20 + 80).toFixed(1))],
    ['간호학과', '2', '2', ...Array.from({ length: 60 }, () => (Math.random() * 20 + 75).toFixed(1))],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, "건양대_핵심역량_진단_양식.xlsx");
};

/**
 * JSON 내보내기 유틸리티
 */
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
 * 엑셀/CSV 파일 분석 메인 서비스
 */
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

        if (rawRows.length === 0) {
          throw new Error('엑셀 파일에 데이터가 없습니다.');
        }

        // 1. 데이터 정규화 (BOM 제거, 공백 제거 등 컬럼명 클리닝)
        const normalizedRows = rawRows.map(row => {
          const newRow: any = {};
          for (const key in row) {
            // 키에서 BOM(\ufeff) 및 모든 공백 제거
            const cleanKey = key.replace(/^\uFEFF/, '').replace(/\s+/g, '');
            newRow[cleanKey] = row[key];
          }
          return newRow;
        });

        const deptMap: Record<string, any[]> = {};
        normalizedRows.forEach(row => {
          // 정규화된 키인 '학과' 혹은 'dept' 등을 찾음
          const deptName = row['학과'] || row['dept'] || row['학과명'] || '미분류 학과';
          if (!deptMap[deptName]) deptMap[deptName] = [];
          deptMap[deptName].push(row);
        });

        const aggregateRows = (dataRows: any[]): AggregatedData => {
          const n = dataRows.length;
          const genderDist = { male: 0, female: 0, unknown: 0 };
          const gradeDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
          
          // 결과 객체 초기화
          const competencyScores: Record<string, number> = {};
          const subCompetencyScores: Record<string, number> = {};

          // 역량별 합계용 임시 저장소
          const compSums: Record<string, number> = {};
          const subCompSums: Record<string, number> = {};

          dataRows.forEach(row => {
            // 인구통계 처리
            const g = String(row['성별'] || row['gender'] || '').trim();
            if (g === '1' || g === '남' || g.toLowerCase() === 'm') genderDist.male++;
            else if (g === '2' || g === '여' || g.toLowerCase() === 'f') genderDist.female++;
            else genderDist.unknown++;

            const grade = parseInt(row['학년'] || row['grade']) || 1;
            if (grade >= 1 && grade <= 4) gradeDist[grade]++;

            // 각 역량별 점수 계산
            COMPETENCY_DEFINITIONS.forEach(comp => {
              let compTotalInRow = 0;
              let compCountInRow = 0;

              comp.questions.forEach(qNum => {
                // '문항1', '문항 1', 'q1' 등에 대응 (이미 정규화 단계에서 '문항1'로 변환됨)
                const valRaw = row[`문항${qNum}`] || row[`q${qNum}`] || "0";
                const val = parseFloat(String(valRaw).replace(/,/g, '.'));

                if (!isNaN(val) && val !== 0) {
                  // 1~5점 척도인 경우 100점으로 환산, 이미 100점대면 그대로 유지
                  const score = (val <= 5 && val > 0) ? val * 20 : val;
                  compTotalInRow += score;
                  compCountInRow++;
                }
              });

              const rowCompAvg = compCountInRow > 0 ? (compTotalInRow / compCountInRow) : 0;
              if (!compSums[comp.id]) compSums[comp.id] = 0;
              compSums[comp.id] += rowCompAvg;

              // 하위 역량 처리
              comp.subCompetencies.forEach(sub => {
                let subTotalInRow = 0;
                let subCountInRow = 0;
                sub.questions.forEach(qNum => {
                  const valRaw = row[`문항${qNum}`] || row[`q${qNum}`] || "0";
                  const val = parseFloat(String(valRaw).replace(/,/g, '.'));
                  if (!isNaN(val) && val !== 0) {
                    const score = (val <= 5 && val > 0) ? val * 20 : val;
                    subTotalInRow += score;
                    subCountInRow++;
                  }
                });
                const rowSubAvg = subCountInRow > 0 ? (subTotalInRow / subCountInRow) : 0;
                if (!subCompSums[sub.id]) subCompSums[sub.id] = 0;
                subCompSums[sub.id] += rowSubAvg;
              });
            });
          });

          // 최종 평균 산출
          COMPETENCY_DEFINITIONS.forEach(comp => {
            competencyScores[comp.id] = parseFloat((compSums[comp.id] / n).toFixed(2));
            comp.subCompetencies.forEach(sub => {
              subCompetencyScores[sub.id] = parseFloat((subCompSums[sub.id] / n).toFixed(2));
            });
          });

          return {
            n,
            updatedAt: new Date().toISOString().split('T')[0],
            isSample: false,
            competencyScores,
            subCompetencyScores,
            genderDistribution: genderDist,
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
        console.error("Excel Processing Detailed Error:", err);
        reject(new Error(`파일 분석 오류: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
    reader.readAsBinaryString(file);
  });
};
