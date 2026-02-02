
import React, { useState } from 'react';
import { UNIVERSITY_COLORS } from '../constants';

const Community: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    org: '',
    tel: '',
    title: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = "okh831@gmail.com";
    const subject = `[KYU 2026 문의] ${formData.title}`;
    const body = `이름: ${formData.name}\n소속: ${formData.org}\n연락처: ${formData.tel}\n\n문의내용:\n${formData.content}`;
    
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = () => {
    const text = `이름: ${formData.name}\n소속: ${formData.org}\n연락처: ${formData.tel}\n내용: ${formData.content}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('문의 내용이 클립보드에 복사되었습니다. 메일 앱에서 붙여넣어주세요.');
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-800">커뮤니티 문의</h1>
        <p className="text-slate-500">진단 시스템 관련 문의 사항은 아래 폼을 통해 전달해주시기 바랍니다.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/3 p-10 bg-slate-900 text-white space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-2 text-green-400">담당 부서</h3>
            <p className="text-sm text-slate-400">교육혁신원 성과관리센터</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2 text-green-400">이메일 문의</h3>
            <p className="text-sm text-slate-400 underline">okh831@gmail.com</p>
          </div>
          <div className="pt-10 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
            문의하신 내용은 담당자가 확인 후 영업일 기준 3일 이내에 회신 드립니다. <br/><br/>
            첨부파일이 필요한 경우 mailto 링크 전송 후 별도 메일에 파일을 추가하여 보내주시기 바랍니다.
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="md:w-2/3 p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500">이름</label>
              <input 
                required
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003478] focus:border-transparent outline-none transition"
                placeholder="성함을 입력하세요"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500">소속</label>
              <input 
                required
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003478] focus:border-transparent outline-none transition"
                placeholder="학과/부서를 입력하세요"
                value={formData.org}
                onChange={e => setFormData({...formData, org: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">제목</label>
            <input 
              required
              type="text" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003478] focus:border-transparent outline-none transition"
              placeholder="문의 제목을 입력하세요"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">내용</label>
            <textarea 
              required
              rows={5}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003478] focus:border-transparent outline-none transition resize-none"
              placeholder="상세한 문의 내용을 작성해주세요"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-4 bg-[#003478] text-white rounded-xl font-bold shadow-lg hover:bg-[#00285a] transition-all"
            >
              문의 제출하기 (메일 앱 열기)
            </button>
            <button 
              type="button"
              onClick={copyToClipboard}
              className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-all"
            >
              메일 앱이 열리지 않으면 복사해서 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Community;
