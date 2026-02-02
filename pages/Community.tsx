
import React, { useState } from 'react';

const Community: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    org: '',
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 요청에 따른 수신처
  const RECIPIENT = "okh831@gmail.com";

  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = `[건양대 핵심역량문의] ${formData.title}`;
    const body = `성함: ${formData.name}\n소속: ${formData.org}\n\n문의내용:\n${formData.content}\n\n--- 건양대 핵심역량 진단 시스템(2026) 발송 ---`;
    
    // 1. 클립보드에 백업 복사
    navigator.clipboard.writeText(body);

    // 2. Gmail 다이렉트 작성 URL 생성 (웹 버전)
    // view=cm: 작성 모드, fs=1: 전체 화면, to: 수신인, su: 제목, body: 본문
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${RECIPIENT}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 3. 약간의 지연 후 실행 (클립보드 복사 시간 확보 및 시각적 피드백)
    setTimeout(() => {
      window.open(gmailUrl, '_blank');
      setIsSubmitting(false);
      alert('Gmail 작성 창이 새 탭에서 열립니다.\n창이 열리지 않으면 팝업 차단을 해제해 주세요.');
    }, 800);
  };

  const copyOnly = () => {
    const text = `수신: ${RECIPIENT}\n제목: [건양대 핵심역량문의] ${formData.title}\n성함: ${formData.name}\n소속: ${formData.org}\n내용: ${formData.content}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('문의 내용이 클립보드에 복사되었습니다. 수동으로 메일을 보내실 때 사용하세요.');
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn py-4">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">커뮤니티 문의</h1>
        <p className="text-lg text-slate-500 font-medium">Outlook 대신 Gmail 서비스를 통해 담당자에게 직접 문의를 전달합니다.</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* 사이드바 영역 */}
        <div className="md:w-[35%] p-12 bg-[#0f172a] text-white flex flex-col justify-between border-r border-slate-800">
          <div className="space-y-12">
            <div>
              <div className="w-12 h-1 bg-[#ea4335] mb-6 rounded-full"></div>
              <h3 className="font-black text-2xl mb-4 text-[#22c55e]">담당 부서</h3>
              <p className="text-lg text-slate-300 font-medium leading-relaxed">교육혁신원 성과관리센터</p>
            </div>
            <div>
              <h3 className="font-black text-2xl mb-4 text-[#ea4335]">Gmail 직통 문의</h3>
              <p className="text-xl text-slate-100 font-black break-all tracking-tight">
                {RECIPIENT}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">Gmail Direct Channel</p>
            </div>
          </div>
          
          <div className="space-y-6 pt-12 border-t border-slate-800 text-sm text-slate-400 leading-relaxed font-medium">
            <p className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#ea4335] rounded-full mt-1.5 flex-shrink-0"></span>
              전송 버튼 클릭 시 Gmail 웹 페이지가 자동으로 실행됩니다.
            </p>
            <p className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#ea4335] rounded-full mt-1.5 flex-shrink-0"></span>
              내용은 자동 복사되므로, Gmail에서 바로 붙여넣기(Ctrl+V) 하셔도 됩니다.
            </p>
          </div>
        </div>
        
        {/* 폼 영역 */}
        <form onSubmit={handleGmailSubmit} className="md:w-[65%] p-12 space-y-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">성함</label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#ea4335] outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                placeholder="성함을 입력하세요"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">소속</label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#ea4335] outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                placeholder="학과/부서명"
                value={formData.org}
                onChange={e => setFormData({...formData, org: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">문의 제목</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#ea4335] outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">상세 내용</label>
            <textarea 
              required
              rows={6}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#ea4335] outline-none transition-all resize-none placeholder:text-slate-300 font-bold text-slate-700"
              placeholder="문의하실 내용을 작성해주세요."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
                isSubmitting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-[#ea4335] text-white hover:bg-[#d93025] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-[#ea4335] rounded-full animate-spin"></div>
                  Gmail 연결 중...
                </>
              ) : (
                <>
                  <span>Gmail로 문의 제출하기</span>
                  <span className="text-2xl">⚡</span>
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={copyOnly}
              className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
            >
              내용만 복사하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Community;
