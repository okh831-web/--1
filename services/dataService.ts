
import * as XLSX from 'xlsx';
import { AggregatedData, DeptAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';

export const processExcelFile = async (file: File): Promise<{ university: AggregatedData; departments: DeptAgg[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          throw new Error('엑셀 파일에 데이터가 없습니다.');
        }

        const deptMap: Record<string, any[]> = {};
        rows.forEach(row => {
          const dept = row.dept || row['학과'] || row['학과명'] || '미분류';
          if (!deptMap[dept]) deptMap[dept] = [];
          deptMap[dept].push(row);
        });

        const aggregateRows = (dataRows: any[]): AggregatedData => {
          const n = dataRows.length;
          const genderDist = { male: 0, female: 0, unknown: 0 };
          const gradeDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
          const compSums: Record<string, number> = {};
          const subCompSums: Record<string, number> = {};

          dataRows.forEach(row => {
            const g = String(row.gender || row['성별'] || '').trim();
            if (g === '1' || g === '남') genderDist.male++;
            else if (g === '2' || g === '여') genderDist.female++;
            else genderDist.unknown++;

            const grade = parseInt(row.grade || row['학년']);
            if (grade >= 1 && grade <= 4) gradeDist[grade]++;

            COMPETENCY_DEFINITIONS.forEach(comp => {
              let compTotal = 0;
              let compCount = 0;
              comp.questions.forEach(qNum => {
                const val = parseFloat(row[`q${qNum}`]);
                if (!isNaN(val)) {
                  // 1~5점 척도를 100점 만점으로 환산 (val * 20)
                  compTotal += (val <= 5 ? val * 20 : val);
                  compCount++;
                }
              });
              if (!compSums[comp.id]) compSums[comp.id] = 0;
              compSums[comp.id] += (compCount > 0 ? (compTotal / compCount) : 0);

              comp.subCompetencies.forEach(sub => {
                let subTotal = 0;
                let subCount = 0;
                sub.questions.forEach(qNum => {
                  const val = parseFloat(row[`q${qNum}`]);
                  if (!isNaN(val)) {
                    // 1~5점 척도를 100점 만점으로 환산 (val * 20)
                    subTotal += (val <= 5 ? val * 20 : val);
                    subCount++;
                  }
                });
                if (!subCompSums[sub.id]) subCompSums[sub.id] = 0;
                subCompSums[sub.id] += (subCount > 0 ? (subTotal / subCount) : 0);
              });
            });
          });

          const competencyScores: Record<string, number> = {};
          Object.keys(compSums).forEach(key => {
            competencyScores[key] = parseFloat((compSums[key] / n).toFixed(2));
          });

          const subCompetencyScores: Record<string, number> = {};
          Object.keys(subCompSums).forEach(key => {
            subCompetencyScores[key] = parseFloat((subCompSums[key] / n).toFixed(2));
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

        const universityAgg = aggregateRows(rows);
        const deptAggs: DeptAgg[] = Object.entries(deptMap).map(([name, data]) => ({
          ...aggregateRows(data),
          deptName: name,
        }));

        resolve({ university: universityAgg, departments: deptAggs });
      } catch (err: any) {
        reject(new Error(`파일 파싱 오류: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
    reader.readAsBinaryString(file);
  });
};
