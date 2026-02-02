
import React from 'react';
import { AppState, PageView } from '../types';
import { CompetencyRadar, SubCompetencyBar, DistributionChart, GenderPieChart } from '../components/Charts';
import { UNIVERSITY_COLORS, COMPETENCY_DEFINITIONS } from '../constants';

interface DashboardProps {
  state: AppState;
  onNavigate: (page: PageView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const { university } = state;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
            대학 전체 진단 현황
          </h1>
          <p className="text-slate-500 mt-1">건양대학교 전체 참여자의 핵심역량 데이터를 집계한 대시보드입니다.</p>
        </div>
        <div className="flex gap-2">
          {university.isSample && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
              샘플 데이터 표시 중
            </span>
          )}
          <button 
            onClick={() => onNavigate('admin')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors"
          >
            데이터 업로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">총 참여 인원(N)</p>
          <p className="text-3xl font-black text-slate-900">{university.n.toLocaleString()}명</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">최종 업데이트 일자</p>
          <p className="text-2xl font-bold text-slate-900">{university.updatedAt}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">6대 역량 전체 평균</p>
          <p className="text-3xl font-black text-green-600">
            {/* Fix: Explicitly cast Object.values to number[] for arithmetic reduction */}
            {((Object.values(university.competencyScores) as number[]).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">데이터 상태</p>
          <p className="text-xl font-bold text-slate-900">{university.isSample ? '분석 대기' : '실데이터 분석'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">6대 핵심역량 종합 분석</h3>
          <CompetencyRadar data={university.competencyScores} name="대학 전체" />
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">12개 하위역량 상세 순위</h3>
          <SubCompetencyBar data={university.subCompetencyScores} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 text-slate-800">참여자 인구통계 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GenderPieChart data={university.genderDistribution} />
          <DistributionChart data={university.gradeDistribution} title="학년별 분포" />
          <div className="flex flex-col justify-center">
            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
              <h5 className="font-bold text-slate-700">참여자 요약</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">가장 높은 역량:</span>
                  <span className="font-bold text-green-600">
                    {/* Fix: Explicitly cast Object.entries to typed array for sorting */}
                    {COMPETENCY_DEFINITIONS.find(c => c.id === (Object.entries(university.competencyScores) as [string, number][]).sort((a,b) => b[1] - a[1])[0][0])?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">집중 개선 필요 역량:</span>
                  <span className="font-bold text-amber-600">
                    {/* Fix: Explicitly cast Object.entries to typed array for sorting */}
                    {COMPETENCY_DEFINITIONS.find(c => c.id === (Object.entries(university.competencyScores) as [string, number][]).sort((a,b) => a[1] - b[1])[0][0])?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
