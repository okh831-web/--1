
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

try {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Initial rendering failed:', error);
  container.innerHTML = `
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: sans-serif;">
      <h1 style="color: #003478; font-weight: 900;">KYU 2026</h1>
      <p style="color: #ef4444; margin-top: 10px;">애플리케이션 실행 중 오류가 발생했습니다.</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #003478; color: white; border: none; border-radius: 8px; cursor: pointer;">새로고침</button>
    </div>
  `;
}
