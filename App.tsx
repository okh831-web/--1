
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DeptHub from './pages/DeptHub';
import DeptDetail from './pages/DeptDetail';
import Community from './pages/Community';
import Admin from './pages/Admin';
import AIAnalyst from './pages/AIAnalyst';
import { AppState, PageView, DeptAgg } from './types';
import { COMPETENCY_DEFINITIONS, INITIAL_UNIVERSITY_DATA, INITIAL_DEPT_DATA } from './constants';

const LOCAL_STORAGE_KEY = 'KYU_CORE_COMP_2026_DATA';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
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
    return {
      university: INITIAL_UNIVERSITY_DATA,
      departments: INITIAL_DEPT_DATA,
      mapping: COMPETENCY_DEFINITIONS,
      lastUpdated: new Date().toISOString(),
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
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
      case 'deptHub':
        return <DeptHub state={state} onSelectDept={handleSelectDept} />;
      case 'deptDetail':
        return selectedDept ? (
          <DeptDetail 
            dept={selectedDept} 
            university={state.university} 
            onBack={() => setCurrentPage('deptHub')} 
          />
        ) : <DeptHub state={state} onSelectDept={handleSelectDept} />;
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
