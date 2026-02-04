
import React, { useState } from 'react';
import { AppState, CategoryAgg, DeptAgg } from '../types';
import { COMPETENCY_DEFINITIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DistributionChart, GenderPieChart, GenderScoreCompareBar } from '../components/Charts';

interface CategoryHubProps {
  state: AppState;
  onSelectDept: (dept: DeptAgg) => void;
}

const CategoryHub: React.FC<CategoryHubProps> = ({ state, onSelectDept }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryAgg | null>(null);

  // state.categories를 직접 사용하여 정합성 유지
  const displayCategories = state.categories;

  // 차트 데이터 구성
  const chartData = COMPETENCY_DEFINITIONS.map(comp => {
    const entry: any = { name: comp.name };
    displayCategories.forEach(cat => {
      entry[cat.categoryName] = cat.competencyScores[comp.id] || 0;
    });
    return entry;
  });

  const categoryColors = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b', '#94a3b8'
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="border-b pb-6 border-slate-200">
        <h1 className="text-3xl font-black text-slate-800">라. 계열별 분석</h1>
        <p className="text-slate-500 mt-1">대학 내 주요 계열별 핵심역량 진단 결과 비교 테이블 및 상세 지표입니다.</p>
      </div>

      {/* 1. 계열별 비교 차트 */}
      <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-700">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          계열별 역량 분포 비교 (그래프)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} axisLine={false} />
              <YAxis domain={[60, 90]} hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px' }} />
              {displayCategories.map((cat, idx) => (
                <Bar key={cat.categoryName} dataKey={cat.categoryName} fill={categoryColors[idx % categoryColors.length]} radius={[4, 4, 0, 0]} barSize={12} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. 계열별 데이터 테이블 */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200 shadow-xl bg-white">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-white border-b-2 border-slate-800">
              <th className="py-5 px-4 font-black text-slate-800 text-sm">구분</th>
              {COMPETENCY_DEFINITIONS.map(comp => (
                <th key={comp.id} className="py-5 px-4 font-black text-slate-800 text-sm">{comp.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayCategories.map((cat, idx) => (
              <tr 
                key={cat.categoryName} 
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer transition-colors ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 border-b border-slate-100`}
              >
                <td className="py-4 px-4 text-sm font-bold text-slate-700 text-left pl-8">{cat.categoryName}</td>
                {COMPETENCY_DEFINITIONS.map(comp => (
                  <td key={comp.id} className="py-4 px-4 text-sm font-medium text-slate-600">
                    {(cat.competencyScores[comp.id] || 0).toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
            {/* 대학 전체 행 */}
            <tr className="bg-slate-100 border-t-2 border-slate-300">
              <td className="py-5 px-4 text-sm font-black text-slate-900 text-left pl-8">대학전체</td>
              {COMPETENCY_DEFINITIONS.map(comp => {
                const totalN = state.departments.reduce((s, d) => s + d.n, 0);
                const avg = totalN > 0 
                  ? (state.departments.reduce((s, d) => s + (d.competencyScores[comp.id] * d.n), 0) / totalN).toFixed(1)
                  : "0.0";
                return (
                  <td key={comp.id} className="py-5 px-4 text-sm font-black text-slate-900">
                    {avg}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </section>

      {/* 3. 선택 계열 상세 분석 (전체 학생 분석) */}
      {activeCategory && (
        <section className="animate-slideUp space-y-8 pb-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              [{activeCategory.categoryName}] 학생 심층 분석
            </h2>
            <button onClick={() => setActiveCategory(null)} className="text-xs font-bold text-slate-400 hover:text-rose-500">닫기 ×</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
              <GenderPieChart data={activeCategory.genderDistribution} />
              {activeCategory.genderCompetencyScores && (
                <GenderScoreCompareBar 
                  maleScores={activeCategory.genderCompetencyScores.male} 
                  femaleScores={activeCategory.genderCompetencyScores.female} 
                />
              )}
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <DistributionChart data={activeCategory.gradeDistribution} title="학년별 분포" />
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-sm flex flex-col justify-center gap-6">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">총 참여 인원</p>
                <p className="text-4xl font-black text-green-400">{activeCategory.n.toLocaleString()}명</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">소속 학과 리스트</p>
                <div className="flex flex-wrap gap-2">
                  {state.departments
                    .filter(d => d.categoryName === activeCategory.categoryName)
                    .map(d => (
                      <span 
                        key={d.deptName} 
                        onClick={() => onSelectDept(d)}
                        className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold hover:bg-white/20 transition-all cursor-pointer"
                      >
                        {d.deptName}
                      </span>
                    ))
                  }
                  {state.departments.filter(d => d.categoryName === activeCategory.categoryName).length === 0 && (
                    <span className="text-xs text-white/20 italic">매핑된 학과 정보가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!activeCategory && (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px]">
          <p className="text-slate-400 font-bold">표에서 계열을 클릭하시면 해당 계열 학생들에 대한 상세 분석 데이터가 나타납니다.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryHub;
