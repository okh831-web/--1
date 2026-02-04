
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CategoryHub from './pages/CategoryHub';
import DeptHub from './pages/DeptHub';
import DeptDetail from './pages/DeptDetail';
import Community from './pages/Community';
import Admin from './pages/Admin';
import AIAnalyst from './pages/AIAnalyst';
import { AppState, PageView, DeptAgg, AggregatedData } from './types';
import { COMPETENCY_DEFINITIONS, INITIAL_UNIVERSITY_DATA, INITIAL_DEPT_DATA } from './constants';
import { aggregateCategories, detectCategory } from './services/dataService';

const LOCAL_STORAGE_KEY = 'KYU_CORE_COMP_2026_DATA_V4';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [lastHubPage, setLastHubPage] = useState<PageView>('categoryHub');
  const [selectedDept, setSelectedDept] = useState<DeptAgg | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    // 초기 샘플 학과 데이터에 계열 정보 매핑
    const initialDepts = INITIAL_DEPT_DATA.map(d => ({
      ...d,
      categoryName: detectCategory(d.deptName)
    }));

    // 샘플 데이터를 바탕으로 실제 계열별 집계 수행 (정합성 보장)
    const initialCategories = aggregateCategories(initialDepts);

    // 대학 전체 데이터도 학과 합산으로 재계산 (인원수 불일치 해결)
    const totalN = initialDepts.reduce((s, d) => s + d.n, 0);
    const universityAgg: AggregatedData = {
      ...INITIAL_UNIVERSITY_DATA,
      n: totalN,
      genderDistribution: {
        male: initialDepts.reduce((s, d) => s + (d.genderDistribution?.male || 0), 0),
        female: initialDepts.reduce((s, d) => s + (d.genderDistribution?.female || 0), 0),
        unknown: initialDepts.reduce((s, d) => s + (d.genderDistribution?.unknown || 0), 0),
      },
      gradeDistribution: {
        1: initialDepts.reduce((s, d) => s + (d.gradeDistribution?.[1] || 0), 0),
        2: initialDepts.reduce((s, d) => s + (d.gradeDistribution?.[2] || 0), 0),
        3: initialDepts.reduce((s, d) => s + (d.gradeDistribution?.[3] || 0), 0),
        4: initialDepts.reduce((s, d) => s + (d.gradeDistribution?.[4] || 0), 0),
      }
    };

    return {
      university: universityAgg,
      departments: initialDepts,
      categories: initialCategories,
      mapping: COMPETENCY_DEFINITIONS,
      lastUpdated: new Date().toISOString(),
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    if (page === 'categoryHub' || page === 'deptHub') {
      setLastHubPage(page);
    }
    setSelectedDept(null);
    window.scrollTo(0, 0);
  };

  const handleSelectDept = (dept: DeptAgg) => {
    setSelectedDept(dept);
    setCurrentPage('deptDetail');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard state={state} onNavigate={handleNavigate} />;
      case 'categoryHub':
        return <CategoryHub state={state} onSelectDept={handleSelectDept} />;
      case 'deptHub':
        return <DeptHub state={state} onSelectDept={handleSelectDept} />;
      case 'deptDetail':
        return selectedDept ? (
          <DeptDetail 
            dept={selectedDept} 
            university={state.university} 
            onBack={() => handleNavigate(lastHubPage)} 
          />
        ) : <CategoryHub state={state} onSelectDept={handleSelectDept} />;
      case 'aiAnalyst':
        return <AIAnalyst state={state} />;
      case 'community':
        return <Community />;
      case 'admin':
        return <Admin state={state} onUpdateState={setState} onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default App;
