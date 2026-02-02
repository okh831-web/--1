
import React, { useState } from 'react';
import { AppState, DeptAgg } from '../types';
import { CompetencyRadar, SubCompetencyBar, DistributionChart, GenderPieChart } from '../components/Charts';
import { UNIVERSITY_COLORS, COMPETENCY_DEFINITIONS } from '../constants';
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="no-print flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          ← 뒤로가기
        </button>
        <div className="text-sm text-slate-400 font-bold tracking-widest uppercase">Department Detail</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-slate-800">{dept.deptName}</h1>
          <p className="text-slate-500 mt-2 text-lg">핵심역량 진단 분석 보고서 (2026)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-gradient-to-br from-[#003478] to-[#009640] text-white rounded-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                분석 보고서 작성 중...
              </>
            ) : (
              <>
                <span className="text-lg">📊</span>
                AI 심층 분석 리포트 생성
              </>
            )}
          </button>
          <button 
            onClick={() => window.print()}
            className="no-print self-center px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
          >
            PDF 출력
          </button>
        </div>
      </div>

      {/* AI 리포트 섹션 - 가독성 강화 */}
      {aiReport && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-slate-900/5 animate-slideUp relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="text-9xl font-black">AI</span>
          </div>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl">✨</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">전문 분석가 심층 리포트</h2>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Academic Performance Analysis</p>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose font-medium">
            {aiReport}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span className="italic">건양대학교 Gemini-3 Pro 성과관리 모듈 생성</span>
            <span className="font-bold">© 2026 Konyang Univ. Educational Innovation</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">대학 평균 대비 분석</h3>
            <span className="text-xs text-slate-400">대학 전체(Base) vs {dept.deptName}</span>
          </div>
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

      <div className="print-break bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-8 text-slate-800 border-l-4 border-[#003478] pl-4">1. 참여 인원 데이터 세부 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GenderPieChart data={dept.genderDistribution} />
          <DistributionChart data={dept.gradeDistribution} title="학년별 분포" />
          <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-center gap-4">
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Summary Statistics</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">핵심 강점 역량</span>
                <span className="font-black text-[#009640]">
                  {COMPETENCY_DEFINITIONS.find(c => c.id === (Object.entries(dept.competencyScores) as [string, number][]).sort((a,b) => b[1] - a[1])[0][0])?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">데이터 갱신 주기</span>
                <span className="font-medium text-slate-700">실시간 연동</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">최종 업데이트</span>
                <span className="font-medium text-slate-700">{dept.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 text-slate-800 border-l-4 border-[#009640] pl-4">2. 세부 지표별 환산 점수 (100점 만점)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold">
                <th className="py-4 px-4">6대 핵심역량</th>
                <th className="py-4 px-4">12대 하위역량</th>
                <th className="py-4 px-4 text-right">학과 점수</th>
                <th className="py-4 px-4 text-right">대학 전체 평균</th>
                <th className="py-4 px-4 text-right">격차(Gap)</th>
              </tr>
            </thead>
            <tbody>
              {COMPETENCY_DEFINITIONS.flatMap((comp) => 
                comp.subCompetencies.map((sub, idx) => {
                  const deptScore = dept.subCompetencyScores[sub.id] || 0;
                  const univScore = university.subCompetencyScores[sub.id] || 0;
                  const gap = deptScore - univScore;
                  return (
                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      {idx === 0 && <td className="py-4 px-4 font-bold bg-slate-50/30" rowSpan={2}>{comp.name}</td>}
                      <td className="py-4 px-4 text-slate-600">{sub.name}</td>
                      <td className="py-4 px-4 text-right font-black">{deptScore.toFixed(1)}</td>
                      <td className="py-4 px-4 text-right text-slate-400">{univScore.toFixed(1)}</td>
                      <td className={`py-4 px-4 text-right font-bold ${gap >= 0 ? 'text-green-600' : 'text-rose-500'}`}>
                        {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeptDetail;
