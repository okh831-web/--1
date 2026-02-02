
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { chatWithAnalyst } from '../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAnalyst: React.FC<{ state: AppState }> = ({ state }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '반갑습니다. 교육성과관리 전문 데이터 분석가입니다. 분석을 원하시는 학과명을 말씀해 주시면, 핵심역량 진단 결과에 기반한 전문 리포트를 작성해 드립니다. (예: "의예과 분석해줘")' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMsg?: string) => {
    const msgToSend = customMsg || input;
    if (!msgToSend.trim() || isLoading) return;

    const userMsg = msgToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await chatWithAnalyst(userMsg, { university: state.university, departments: state.departments });
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const quickDepts = state.departments.slice(0, 3).map(d => d.deptName);

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      <div className="bg-gradient-to-r from-[#003478] to-[#1e4b8f] p-6 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">📈</div>
          <div>
            <h2 className="font-black text-lg tracking-tight">전문 교육분석가 AI</h2>
            <p className="text-xs opacity-70 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              2026학년도 성과지표 분석 엔진 가동 중
            </p>
          </div>
        </div>
        <div className="hidden md:block text-xs text-white/50 bg-black/20 px-3 py-1 rounded-full">
          Gemini-3 Pro v2.5 Analytic
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#003478] text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                  AI Analytic Report
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 rounded-tl-none flex flex-col gap-3">
              <div className="flex gap-2 items-center text-sm text-[#003478] font-bold">
                <span className="animate-spin text-lg">⚙️</span>
                데이터 추출 및 교차 분석 중...
              </div>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 animate-progressBar"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-400 self-center mr-2">빠른 분석:</span>
          {quickDepts.map(name => (
            <button 
              key={name}
              onClick={() => handleSend(`${name} 분석해줘`)}
              className="px-3 py-1 text-xs bg-slate-100 hover:bg-[#003478] hover:text-white text-slate-600 rounded-full transition-all border border-slate-200"
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="flex-grow p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#003478] border border-slate-100 transition-all text-sm font-medium"
            placeholder="예: 간호학과 분석 리포트 작성해줘"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading}
            className="px-8 bg-[#003478] text-white rounded-2xl font-black hover:bg-[#1e4b8f] transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            분석 요청
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyst;
