
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element to mount to");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the application:", error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #ef4444;">시스템 초기화 오류</h2>
        <p style="color: #64748b;">애플리케이션을 실행하는 중 문제가 발생했습니다. 브라우저를 새로고침하거나 관리자에게 문의하세요.</p>
      </div>
    `;
  }
};

// DOM이 완전히 로드된 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
