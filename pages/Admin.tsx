
import React, { useState } from 'react';
import { AppState } from '../types';
import { processExcelFile } from '../services/dataService';
import { INITIAL_UNIVERSITY_DATA, INITIAL_DEPT_DATA, COMPETENCY_DEFINITIONS } from '../constants';

interface AdminProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

const Admin: React.FC<AdminProps> = ({ state, onUpdateState }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { university, departments } = await processExcelFile(file);
      onUpdateState({
        ...state,
        university,
        departments,
        lastUpdated: new Date().toISOString()
      });
      alert('데이터 업로드 및 집계가 완료되었습니다.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const resetToSample = () => {
    if (confirm('모든 데이터를 삭제하고 샘플 데이터로 복구하시겠습니까?')) {
      onUpdateState({
        university: INITIAL_UNIVERSITY_DATA,
        departments: INITIAL_DEPT_DATA,
        mapping: COMPETENCY_DEFINITIONS,
        lastUpdated: new Date().toISOString()
      });
      alert('초기화되었습니다.');
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KYU_Competency_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-6 border-slate-200">
        <h1 className="text-3xl font-black text-slate-800">관리자 대시보드</h1>
        <p className="text-slate-500 mt-1">시스템 데이터 관리 및 매핑 규칙 설정을 수행합니다.</p>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-bold">데이터 업로드</h2>
        </div>
        
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4">
          <p className="text-slate-500 text-sm">
            Konyang_AIStudio_Upload_2026.xlsx 형식의 파일을 업로드하세요.<br/>
            (필수 컬럼: dept, gender, grade, q1 ~ q60)
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="excel-upload"
          />
          <label 
            htmlFor="excel-upload"
            className={`inline-block px-10 py-3 bg-[#003478] text-white rounded-xl font-bold cursor-pointer transition-all ${isUploading ? 'opacity-50' : 'hover:translate-y-[-2px] hover:shadow-lg'}`}
          >
            {isUploading ? '처리 중...' : '엑셀 파일 선택'}
          </label>
          
          {error && (
            <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-sm font-medium">
              ❌ {error}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-bold">매핑 규칙 확인 (Read-only)</h2>
        </div>
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">핵심역량</th>
                <th className="p-4">하위역량</th>
                <th className="p-4">문항 매핑</th>
              </tr>
            </thead>
            <tbody>
              {COMPETENCY_DEFINITIONS.map(comp => (
                <React.Fragment key={comp.id}>
                  {comp.subCompetencies.map((sub, idx) => (
                    <tr key={sub.id} className="border-t border-slate-50">
                      {idx === 0 && <td className="p-4 font-bold bg-slate-50/50" rowSpan={2}>{comp.name}</td>}
                      <td className="p-4">{sub.name}</td>
                      <td className="p-4 font-mono text-xs text-slate-400">q{sub.questions[0]} ~ q{sub.questions[sub.questions.length-1]}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-wrap gap-4">
        <button 
          onClick={exportData}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
        >
          데이터 JSON 내보내기
        </button>
        <button 
          onClick={resetToSample}
          className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-all"
        >
          데이터 초기화 (샘플로 복원)
        </button>
      </section>
    </div>
  );
};

export default Admin;
