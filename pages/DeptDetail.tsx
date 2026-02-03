
import React, { useState } from 'react';
import { AppState, DeptAgg } from '../types';
import { CompetencyRadar, SubCompetencyBar, DistributionChart, GenderPieChart, GenderScoreCompareBar } from '../components/Charts';
import { COMPETENCY_DEFINITIONS } from '../constants';
import { generateDeptReport } from '../services/aiService';

interface DeptDetailProps {
  dept: DeptAgg;
  university: AppState['university'];
  onBack: () => void;
}

const DeptDetail: React.FC<DeptDetailProps> = ({ dept, university, onBack }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const report = await generateDeptReport(dept, university);
    setAiReport(report);
    setIsGenerating(false);
  };

  // 최고 역량 찾기
  const sortedCompEntries = (Object.entries(dept.competencyScores) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const topCompId = sortedCompEntries[0][0];
  const topCompScore = sortedCompEntries[0][1];
  const topCompName = COMPETENCY_DEFINITIONS.find(c => c.id === topCompId)?.name || '알 수 없음';

  // 성별 격차 계산 (안전 처리)
  const calculateGenderGap = () => {
    if (!dept.genderCompetencyScores || (dept.genderDistribution.male === 0 && dept.genderDistribution.female === 0)) {
      return "0.00";
    }
    const maleAvg = (Object.values(dept.genderCompetencyScores.male) as number[]).reduce((a, b) => a + b, 0) / 6;
    const femaleAvg = (Object.values(dept.genderCompetencyScores.female) as number[]).reduce((a, b) => a + b, 0) / 6;
    
    // 한쪽 성별이 없는 경우 비교가 불가능하므로 0 처리
    if (dept.genderDistribution.male === 0 || dept.genderDistribution.female === 0) return "0.00";
    
    return Math.abs(maleAvg - femaleAvg).toFixed(2);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="no-print flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          ← 뒤로가기
        </button>
        <div className="text-sm text-slate-400 font-bold tracking-widest uppercase">Department Detail Analysis</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-slate-800">{dept.deptName}</h1>
          <p className="text-slate-500 mt-2 text-lg">성별 및 학년별 교차 분석 보고서 (2026)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-gradient-to-br from-[#003478] to-[#009640] text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            {isGenerating ? "작성 중..." : "✨ AI 성별 격차 포함 리포트 생성"}
          </button>
          <button onClick={() => window.print()} className="no-print self-center px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">PDF</button>
        </div>
      </div>

      {aiReport && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-slate-900/5 animate-slideUp">
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose font-medium">
            {aiReport}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">대학 전체 평균 대비 격차</h3>
          <CompetencyRadar 
            data={dept.competencyScores} 
            compareData={university.competencyScores} 
            name={dept.deptName} 
            compareName="대학 전체" 
          />
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">학과 내 역량 순위</h3>
          <SubCompetencyBar data={dept.subCompetencyScores} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-8 text-slate-800 border-l-4 border-[#003478] pl-4">학과 인구통계 및 성별 역량 상세 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-8">
            <GenderPieChart data={dept.genderDistribution} />
            {dept.genderCompetencyScores && (
              <GenderScoreCompareBar 
                maleScores={dept.genderCompetencyScores.male} 
                femaleScores={dept.genderCompetencyScores.female} 
              />
            )}
          </div>
          <DistributionChart data={dept.gradeDistribution} title="학년별 분포" />
          <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-start gap-6 h-fit">
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">학과 분석 요약</h4>
            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-500 font-medium">최고 역량</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#009640] text-lg">{topCompName}</span>
                  <span className="bg-[#009640]/10 text-[#009640] px-2 py-0.5 rounded-lg text-xs font-black">{topCompScore.toFixed(1)}점</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-500 font-medium">성별 점수 격차</span>
                <span className="font-black text-blue-600 text-lg">
                   {calculateGenderGap()}점
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-500 font-medium">분석 인원 (N)</span>
                <span className="font-black text-slate-800 text-lg">{dept.n}명</span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed italic mt-4 bg-white/50 p-3 rounded-xl">
                * 성별 점수 격차는 6대 핵심역량 평균의 절댓값 차이입니다. 특정 성별 데이터가 없을 경우 0.00점으로 표시됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptDetail;
