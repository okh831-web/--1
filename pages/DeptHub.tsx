
import React, { useState, useMemo } from 'react';
import { AppState, DeptAgg } from '../types';

interface DeptHubProps {
  state: AppState;
  onSelectDept: (dept: DeptAgg) => void;
}

const DeptHub: React.FC<DeptHubProps> = ({ state, onSelectDept }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'n' | 'avg'>('name');

  const filteredDepts = useMemo(() => {
    let result = state.departments.filter(d => d.deptName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    result.sort((a, b) => {
      if (sortKey === 'name') return a.deptName.localeCompare(b.deptName);
      if (sortKey === 'n') return b.n - a.n;
      const avgA = (Object.values(a.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
      const avgB = (Object.values(b.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
      return avgB - avgA;
    });

    return result;
  }, [state.departments, searchTerm, sortKey]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800">학과별 분석 허브</h1>
          <p className="text-slate-500 mt-1">건양대학교의 각 학과별 역량 수준과 대학 평균을 대조 분석합니다.</p>
        </div>
        {!state.university.isSample && (
          <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm animate-bounce">
            ✅ 실시간 분석 데이터 활성화됨
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="찾으시는 학과명을 입력하세요..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003478] focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => setSortKey('name')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition ${sortKey === 'name' ? 'bg-[#003478] text-white' : 'bg-slate-100 text-slate-500'}`}>이름순</button>
          <button onClick={() => setSortKey('n')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition ${sortKey === 'n' ? 'bg-[#003478] text-white' : 'bg-slate-100 text-slate-500'}`}>표본수순</button>
          <button onClick={() => setSortKey('avg')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition ${sortKey === 'avg' ? 'bg-[#003478] text-white' : 'bg-slate-100 text-slate-500'}`}>점수순</button>
        </div>
      </div>

      {filteredDepts.length === 0 ? (
        <div className="bg-white py-24 text-center rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">해당 조건에 맞는 학과가 없습니다.</p>
          <p className="text-xs text-slate-300 mt-2">관리자에서 데이터를 새로 고침해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDepts.map((dept) => {
            const avg = (Object.values(dept.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
            return (
              <div 
                key={dept.deptName} 
                onClick={() => onSelectDept(dept)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:translate-y-[-4px] hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              >
                {!dept.isSample && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-green-500 text-[10px] text-white font-bold rounded-bl-lg">
                    ACTUAL
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold group-hover:text-[#003478] transition-colors line-clamp-1">{dept.deptName}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sample Size: {dept.n}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400">Total Avg.</span>
                    <span className="text-2xl font-black text-[#009640] leading-none">{avg.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${avg >= 80 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${avg}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase">Analysis Report</span>
                  <span className="text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeptHub;
