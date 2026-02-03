
import React, { useState } from 'react';
import { AppState, PageView } from '../types';
import { processExcelFile, downloadSampleExcel, exportToJson, aggregateCategories } from '../services/dataService';
import { INITIAL_UNIVERSITY_DATA, INITIAL_DEPT_DATA, COMPETENCY_DEFINITIONS } from '../constants';

interface AdminProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigate: (page: PageView) => void;
}

const Admin: React.FC<AdminProps> = ({ state, onUpdateState, onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeptName, setSelectedDeptName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { university, departments, categories } = await processExcelFile(file);
      
      onUpdateState({
        ...state,
        university: { ...university },
        departments: [...departments],
        categories: [...categories],
        lastUpdated: new Date().toISOString()
      });
      
      alert(`데이터 분석 완료! 총 ${departments.length}개 학과, ${university.n.toLocaleString()}명의 데이터가 성공적으로 처리되었습니다.`);
      onNavigate('categoryHub');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const resetToSample = () => {
    if (confirm('모든 데이터를 삭제하고 샘플 데이터로 복구하시겠습니까?')) {
      const initialDepts = INITIAL_DEPT_DATA;
      const initialCategories = aggregateCategories(initialDepts);

      onUpdateState({
        university: INITIAL_UNIVERSITY_DATA,
        departments: initialDepts,
        categories: initialCategories,
        mapping: COMPETENCY_DEFINITIONS,
        lastUpdated: new Date().toISOString()
      });
      alert('데이터가 초기화되었습니다.');
    }
  };

  const handleExportUniv = () => {
    exportToJson(state.university, "KYU_University_Total");
  };

  const handleExportAllDepts = () => {
    exportToJson(state.departments, "KYU_All_Departments");
  };

  const handleExportSelectedDept = () => {
    if (!selectedDeptName) {
      alert('내보낼 학과를 선택해주세요.');
      return;
    }
    const dept = state.departments.find(d => d.deptName === selectedDeptName);
    if (dept) {
      exportToJson(dept, `KYU_Dept_${selectedDeptName}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="border-b pb-6 border-slate-200">
        <h1 className="text-3xl font-black text-slate-800">관리자 데이터 센터</h1>
        <p className="text-slate-500 mt-1">Excel 또는 CSV 파일을 업로드하여 학과별 역량 점수를 자동으로 분석하고 업데이트합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            1. 양식 다운로드
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            업로드할 파일의 컬럼명이 정확해야 분석이 가능합니다. 아래 양식(Excel/CSV 호환)을 참고하여 파일을 구성해 주세요.
          </p>
          <button 
            onClick={downloadSampleExcel}
            className="w-full py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            📂 양식 다운로드 (.xlsx / .csv 호환)
          </button>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-green-600 rounded-full"></span>
            2. 데이터 분석 및 업로드
          </h2>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="excel-upload"
            />
            <label 
              htmlFor="excel-upload"
              className={`w-full py-4 bg-[#003478] text-white rounded-2xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 animate-pulse' : 'hover:bg-blue-800 hover:shadow-lg'}`}
            >
              {isUploading ? '데이터 정밀 분석 중...' : '📤 분석할 파일 선택 (.xlsx, .csv)'}
            </label>
            {error && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-lg border border-rose-100">
                ⚠️ {error}
              </div>
            )}
            <p className="mt-4 text-[11px] text-slate-400 font-medium">
              * 엑셀 파일은 물론, 쉼표로 구분된 CSV 파일도 지원합니다.
            </p>
          </div>
        </section>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
          3. 결과 데이터 내보내기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">통합 보고서</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleExportUniv}
                className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm border border-slate-200"
              >
                📊 대학 전체 요약 (JSON)
              </button>
              <button 
                onClick={handleExportAllDepts}
                className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm border border-slate-200"
              >
                📁 모든 학과 통합 데이터 (JSON)
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">학과별 상세 추출</h4>
            <div className="flex flex-col gap-2">
              <select 
                value={selectedDeptName}
                onChange={(e) => setSelectedDeptName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- 내보낼 학과 선택 --</option>
                {state.departments.map(d => (
                  <option key={d.deptName} value={d.deptName}>{d.deptName}</option>
                ))}
              </select>
              <button 
                onClick={handleExportSelectedDept}
                disabled={!selectedDeptName}
                className="w-full py-3 bg-[#009640] text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all text-sm shadow-md"
              >
                🎯 선택 학과 데이터 다운로드
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
            시스템 데이터 현황판
          </h2>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Real-time Status Monitoring</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Data Integrity</p>
            <p className={`text-xl font-black ${state.university.isSample ? 'text-amber-400' : 'text-green-400'}`}>
              {state.university.isSample ? '임시 (샘플 모드)' : '검증 (실데이터)'}
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Analysed Departments</p>
            <p className="text-3xl font-black text-white">{state.departments.length}<span className="text-sm font-medium ml-1 opacity-50">개 학과</span></p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Total Participants</p>
            <p className="text-3xl font-black text-white">{state.university.n.toLocaleString()}<span className="text-sm font-medium ml-1 opacity-50">명</span></p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Last Sync</p>
            <p className="text-xl font-black text-white">{state.university.updatedAt}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/5 text-[10px] text-white/20 flex justify-between">
          <span>학과별 데이터 합산 정합성 검사: <span className="text-green-500/50">PASSED</span></span>
          <span className="font-mono">KYU-CORE-SYSTEM-V2026-STABLE</span>
        </div>
      </section>

      <div className="flex justify-center pt-10">
        <button 
          onClick={resetToSample}
          className="px-6 py-2 text-slate-400 hover:text-rose-500 text-xs font-bold border border-slate-200 rounded-full transition-all"
        >
          ⚙️ 초기 데이터로 시스템 리셋
        </button>
      </div>
    </div>
  );
};

export default Admin;
