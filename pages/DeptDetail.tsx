
import React, { useState } from 'react';
import { AppState, DeptAgg } from '../types';
import { CompetencyRadar, SubCompetencyBar, DistributionChart, GenderPieChart, GenderScoreCompareBar, AdmissionScoreChart } from '../components/Charts';
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

  // 1. 최고 핵심 역량 찾기
  const sortedCompEntries = (Object.entries(dept.competencyScores || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const topCompId = sortedCompEntries.length > 0 ? sortedCompEntries[0][0] : null;
  const topCompScore = sortedCompEntries.length > 0 ? sortedCompEntries[0][1] : 0;
  const topCompName = topCompId ? (COMPETENCY_DEFINITIONS.find(c => c.id === topCompId)?.name || '알 수 없음') : '데이터 없음';

  // 2. 최저 핵심 역량 찾기
  const minCompId = sortedCompEntries.length > 0 ? sortedCompEntries[sortedCompEntries.length - 1][0] : null;
  const minCompScore = sortedCompEntries.length > 0 ? sortedCompEntries[sortedCompEntries.length - 1][1] : 0;
  const minCompName = minCompId ? (COMPETENCY_DEFINITIONS.find(c => c.id === minCompId)?.name || '알 수 없음') : '데이터 없음';

  // 3. 최저 하위 역량 찾기
  const sortedSubCompEntries = (Object.entries(dept.subCompetencyScores || {}) as [string, number][]).sort((a, b) => a[1] - b[1]);
  const minSubId = sortedSubCompEntries.length > 0 ? sortedSubCompEntries[0][0] : null;
  const minSubScore = sortedSubCompEntries.length > 0 ? sortedSubCompEntries[0][1] : 0;
  
  let minSubName = minSubId ? '알 수 없음' : '데이터 없음';
  if (minSubId) {
    COMPETENCY_DEFINITIONS.forEach(c => {
      const found = c.subCompetencies.find(s => s.id === minSubId);
      if (found) minSubName = found.name;
    });
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="no-print flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">← 뒤로가기</button>
        <div className="text-sm text-slate-400 font-bold tracking-widest uppercase">Department Detail Analysis</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-slate-800">{dept.deptName}</h1>
          <p className="text-slate-500 mt-2 text-lg">성별·학년·전형별 입체 분석 보고서 (2026)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-gradient-to-br from-[#003478] to-[#009640] text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            {isGenerating ? "작성 중..." : "✨ AI 심층 리포트 생성"}
          </button>
          <button onClick={() => window.print()} className="no-print self-center px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300">PDF</button>
        </div>
      </div>

      {aiReport && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-slate-900/5 animate-slideUp">
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose font-medium">{aiReport}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">대학 전체 평균 대비 격차</h3>
          <CompetencyRadar data={dept.competencyScores} compareData={university.competencyScores} name={dept.deptName} compareName="대학 전체" />
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">학과 내 역량 순위</h3>
          <SubCompetencyBar data={dept.subCompetencyScores} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-8 text-slate-800 border-l-4 border-[#003478] pl-4">학과 인구통계 및 모집전형 상세 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* 1열: 성별 분포 및 성별 역량 격차 (좌측 그래프 유지) */}
          <div className="space-y-8">
            <GenderPieChart data={dept.genderDistribution} />
            {dept.genderCompetencyScores && (
              <GenderScoreCompareBar maleScores={dept.genderCompetencyScores.male} femaleScores={dept.genderCompetencyScores.female} />
            )}
          </div>

          {/* 2열: 학년별 분포 및 통합된 모집전형 역량 지수 그래프 */}
          <div className="space-y-12">
            <DistributionChart data={dept.gradeDistribution} title="학년별 분포" />
            <div className="pt-8 border-t border-slate-100">
              {/* 전형별 분석은 이 그래프 하나로 집중 */}
              <AdmissionScoreChart data={dept.admissionCompetencyScores} />
            </div>
          </div>

          {/* 3열: 분석 요약 카드 (디자인 최적화: 타이틀 키우고 박스 줄이기) */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between gap-8 min-h-[380px] border border-slate-800">
              <div className="space-y-3">
                <h4 className="font-black text-xl text-white tracking-tight border-b border-white/10 pb-3 flex items-center justify-between">
                  학과 분석 핵심 지표
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Core Summary</span>
                </h4>
                <p className="text-xs text-white/40 font-medium">실시간 데이터 기반 성취도 진단</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-1">최고 핵심 역량</p>
                    <p className="text-2xl font-black text-green-400">{topCompName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{topCompScore.toFixed(1)}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase">SCORE</p>
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">최저 핵심 역량</p>
                    <p className="text-2xl font-black text-rose-400">{minCompName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{minCompScore.toFixed(1)}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase">SCORE</p>
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">최저 하위 역량</p>
                    <p className="text-2xl font-black text-orange-400">{minSubName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{minSubScore.toFixed(1)}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase">SCORE</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold">
                <span className="text-white/20">TOTAL N: {dept.n.toLocaleString()}</span>
                <span className="text-blue-500/50 uppercase">Konyang University</span>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[11px] text-slate-400 leading-relaxed italic">
                * 본 핵심 지표는 학과 내 학생들의 역량 수준을 다각도로 분석한 결과입니다. 최저 성취 역량에 대해서는 교육과정 고도화 및 보완 프로그램 설계를 권장합니다.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptDetail;
