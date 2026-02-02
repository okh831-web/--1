
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
    let result = state.departments.filter(d => d.deptName.includes(searchTerm));
    
    result.sort((a, b) => {
      if (sortKey === 'name') return a.deptName.localeCompare(b.deptName);
      if (sortKey === 'n') return b.n - a.n;
      // Fix: Explicitly cast competency scores values to number[] for average calculation
      const avgA = (Object.values(a.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
      const avgB = (Object.values(b.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
      return avgB - avgA;
    });

    return result;
  }, [state.departments, searchTerm, sortKey]);

  return (
    <div className="space-y-8">
      <div className="border-b pb-6 border-slate-200">
        <h1 className="text-3xl font-black text-slate-800">학과별 상세 분석 허브</h1>
        <p className="text-slate-500 mt-1">건양대학교 각 학과별 진단 결과와 비교 분석 데이터를 제공합니다.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="학과명을 검색하세요..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003478] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button onClick={() => setSortKey('name')} className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition ${sortKey === 'name' ? 'bg-[#003478] text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>가나다순</button>
          <button onClick={() => setSortKey('n')} className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition ${sortKey === 'n' ? 'bg-[#003478] text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>표본수순</button>
          <button onClick={() => setSortKey('avg')} className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition ${sortKey === 'avg' ? 'bg-[#003478] text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>점수순</button>
        </div>
      </div>

      {filteredDepts.length === 0 ? (
        <div className="bg-white py-20 text-center rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            // Fix: Explicitly cast competency scores values to number[] for average calculation
            const avg = (Object.values(dept.competencyScores) as number[]).reduce((sum, val) => sum + val, 0) / 6;
            return (
              <div 
                key={dept.deptName} 
                onClick={() => onSelectDept(dept)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:translate-y-[-4px] hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-[#003478] transition-colors">{dept.deptName}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500">N={dept.n}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400">전체 역량 평균</span>
                    <span className="text-2xl font-black text-[#009640]">{avg.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#009640] h-full" style={{ width: `${avg}%` }}></div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>상세 보기</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
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
