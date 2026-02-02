
import React from 'react';
import { AppState, PageView } from '../types';
import { CompetencyRadar, SubCompetencyBar, DistributionChart, GenderPieChart, GenderScoreCompareBar } from '../components/Charts';

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
          <p className="text-slate-500 mt-1">건양대학교 전체 참여자의 성별/학년별 역량 데이터를 심층 분석합니다.</p>
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
            {((Object.values(university.competencyScores) as number[]).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">데이터 분석 수준</p>
          <p className="text-xl font-bold text-slate-900">성별·학년 교차 분석</p>
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
        <h3 className="text-xl font-bold mb-6 text-slate-800">심층 인구통계 및 성별 역량 분석</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <GenderPieChart data={university.genderDistribution} />
            {university.genderCompetencyScores && (
               <GenderScoreCompareBar 
                 maleScores={university.genderCompetencyScores.male} 
                 femaleScores={university.genderCompetencyScores.female} 
               />
            )}
          </div>
          <DistributionChart data={university.gradeDistribution} title="학년별 분포" />
          <div className="flex flex-col justify-start gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
              <h5 className="font-bold text-slate-700 border-b pb-2">성별 분석 인사이트</h5>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">성별 인원비</p>
                  <p className="font-bold">남성 {((university.genderDistribution.male / university.n) * 100).toFixed(1)}% : 여성 {((university.genderDistribution.female / university.n) * 100).toFixed(1)}%</p>
                </div>
                {university.genderCompetencyScores && (
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-1">성별 역량 격차</p>
                    <p className="text-slate-600 leading-relaxed">
                      현재 데이터 상에서 남성과 여성 간의 핵심역량 평균 점수는 
                      <span className="font-bold text-blue-600 ml-1">
                        {Math.abs(
                          (Object.values(university.genderCompetencyScores.male) as number[]).reduce((a,b)=>a+b,0)/6 - 
                          (Object.values(university.genderCompetencyScores.female) as number[]).reduce((a,b)=>a+b,0)/6
                        ).toFixed(2)}점
                      </span> 차이를 보이고 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
