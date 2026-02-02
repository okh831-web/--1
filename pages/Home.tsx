
import React from 'react';
import { COMPETENCY_DEFINITIONS, UNIVERSITY_COLORS } from '../constants';
import { PageView } from '../types';

interface HomeProps {
  onNavigate: (page: PageView) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <section className="text-center space-y-6 animate-fadeIn py-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: UNIVERSITY_COLORS.navy }}>
          건양대학교 핵심역량 진단 포털 <span className="text-green-600">2026</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          미래를 향한 건양의 인재상, 6대 핵심역량 진단 분석을 통해 <br className="hidden md:block"/>
          데이터 기반 교육의 질적 향상과 학생 성장을 지원합니다.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-3 bg-[#003478] text-white rounded-full font-bold shadow-lg hover:translate-y-[-2px] transition-all"
          >
            대시보드 바로가기
          </button>
          <button 
            onClick={() => onNavigate('deptHub')}
            className="px-8 py-3 bg-[#009640] text-white rounded-full font-bold shadow-lg hover:translate-y-[-2px] transition-all"
          >
            학과별 결과 분석
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPETENCY_DEFINITIONS.map((comp) => (
          <div key={comp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: UNIVERSITY_COLORS.navy }}>
                <span className="text-2xl font-bold">{comp.name.substring(0, 1)}</span>
              </div>
              <h3 className="text-xl font-bold">{comp.name}</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {comp.name} 역량은 학생의 성숙한 자아를 형성하고 타인과 공존하며 실천적 전문성을 발휘하는 기본 토대가 됩니다.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">하위역량</p>
              <ul className="grid grid-cols-2 gap-2">
                {comp.subCompetencies.map(sub => (
                  <li key={sub.id} className="text-sm bg-slate-50 p-2 rounded-lg text-slate-700 font-medium">
                    • {sub.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold" style={{ color: UNIVERSITY_COLORS.navy }}>커뮤니티 및 지원</h2>
          <p className="text-slate-600">진단 도구 사용법, 데이터 분석 의뢰, 혹은 시스템 오류 보고가 필요하신가요? 건양대학교 교육혁신단으로 문의해주시기 바랍니다.</p>
          <button 
            onClick={() => onNavigate('community')}
            className="px-6 py-2 border-2 rounded-lg font-bold transition-all"
            style={{ borderColor: UNIVERSITY_COLORS.green, color: UNIVERSITY_COLORS.green }}
          >
            문의하기
          </button>
        </div>
        <div className="flex-shrink-0 w-full md:w-64 h-40 bg-gradient-to-br from-[#003478] to-[#009640] rounded-2xl flex items-center justify-center">
          <span className="text-white text-4xl font-black">KYU 2026</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
