
import React from 'react';
import { UNIVERSITY_COLORS } from '../constants';
import { PageView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', label: '홈' },
    { id: 'dashboard', label: '전체 대시보드' },
    { id: 'deptHub', label: '학과별 보기' },
    { id: 'aiAnalyst', label: 'AI 분석가' }, // 신설
    { id: 'community', label: '커뮤니티' },
    { id: 'admin', label: '관리자' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="no-print sticky top-0 z-50 shadow-md text-white" style={{ backgroundColor: UNIVERSITY_COLORS.navy }}>
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-white text-[#003478] font-black rounded-lg flex items-center justify-center text-xl">K</div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">건양대학교</span>
              <span className="text-xs opacity-80 uppercase tracking-widest">Core Competency 2026</span>
            </div>
          </div>
          
          <nav className="flex gap-1 md:gap-4 mt-2 md:mt-0 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as PageView)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  currentPage === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {item.id === 'aiAnalyst' && <span className="text-xs">✨</span>}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">건양대학교 핵심역량 진단 분석 시스템 (Stable 2026 Edition)</p>
          <p className="text-sm opacity-60">© 2026 Konyang University. All Rights Reserved.</p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <button onClick={() => window.print()} className="hover:text-white">페이지 PDF 저장</button>
            <span className="opacity-20">|</span>
            <span className="text-green-500 font-bold">AI Analytics Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
