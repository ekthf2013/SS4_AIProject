import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Users, CheckCircle2, ChevronRight, MessageSquare, TrendingUp, BookOpen, BarChart2, GraduationCap, Mic, ExternalLink, Send } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { USER_ROLES, INITIAL_MEMBERS } from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const Onboarding = ({ role }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('guide');
  const [viewType, setViewType] = useState('my'); // 'my' or 'dept'
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  // Chat Guide States
  const [chatMessages, setChatMessages] = useState([
     { role: 'ai', text: '안녕하세요! SDV 시스템 부문 온보딩 가이드 챗봇입니다. 시스템 설정, 교육 과정, 사내 문화 등 궁금한 점을 입력해 주세요.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const toggleCheck = (memberId, key) => {
    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, progress: { ...m.progress, [key]: !m.progress[key] } } : m
    ));
  };

  const filteredMembers = useMemo(() => {
    if (viewType === 'my') return members.filter(m => m.id === 1); // Mock: ID 1 is the logged-in user
    return members.filter(m => m.type === 'DEPT');
  }, [members, viewType]);

  useEffect(() => {
    if (viewType === 'my') setSelectedMember(members.find(m => m.id === 1));
    else setSelectedMember(null);
  }, [viewType, members]);

  const handleSendChat = async () => {
    if(!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat-guide', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            message: userMsg,
            notebookUrl: "https://notebooklm.google.com/notebook/2d4b0ec8-fdc4-4655-af25-b33a94d92d2b?authuser=1"
         })
      });
      const data = await res.json();
      if(data.success) {
         let answerText = data.answer || '';
         // Cleanup notebookLM extra reminders & footnotes
         const reminderIndex = answerText.indexOf("EXTREMELY IMPORTANT: Is that ALL you need to know?");
         if (reminderIndex !== -1) answerText = answerText.substring(0, reminderIndex);
         answerText = answerText.replace(/\n\s*\d+\s*\n/g, '\n'); 
         answerText = answerText.replace(/\n\s*([.,])\s*/g, '$1\n'); 
         answerText = answerText.replace(/^\s*\d+\s*$/gm, ''); 
         answerText = answerText.replace(/^\s*([.,])\s*$/gm, '');

         setChatMessages(prev => [...prev, { role: 'ai', text: answerText.trim() }]);
      } else {
         setChatMessages(prev => [...prev, { role: 'error', text: '오류가 발생했습니다: ' + (data.error || '알 수 없는 오류') }]);
      }
    } catch(err) {
      setChatMessages(prev => [...prev, { role: 'error', text: '네트워크 연결 오류: ' + err.message }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const TabIcon = ({ tab }) => {
    switch(tab) {
      case 'guide': return <BookOpen size={16} />;
      case 'growth': return <BarChart2 size={16} />;
      case 'education': return <GraduationCap size={16} />;
      case 'conference': return <Mic size={16} />;
      default: return null;
    }
  };

  return (
    <PremiumPage>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <SectionHeader title={t('onboarding_title')} subtitle={t('onboarding_sub')} />

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {/* Manager Toggle */}
          {role === USER_ROLES.MANAGER && (
            <div className="flex items-center gap-2 px-2 bg-blue-50/50 rounded-xl py-1 mr-2">
              <button
                onClick={() => setViewType('my')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  viewType === 'my' ? "text-blue-600 bg-white shadow-sm" : "text-gray-500 hover:text-blue-600"
                )}
              >
                <User size={16} /> 나의 온보딩 현황
              </button>
              <button
                onClick={() => setViewType('dept')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  viewType === 'dept' ? "text-blue-600 bg-white shadow-sm" : "text-gray-500 hover:text-blue-600"
                )}
              >
                <Users size={16} /> 부서 현황
              </button>
            </div>
          )}

          {/* Main Tabs */}
          <div className="flex gap-1">
            {['guide', 'growth', 'education', 'conference'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <TabIcon tab={tab} />
                {t(`tab_${tab}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* GROWTH TAB */}
        {activeTab === 'growth' && (
          <>
            {/* Personnel List (Visible in Dept mode) */}
            {viewType === 'dept' && (
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider pl-1 mb-2">부서 인원</h4>
                {filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3",
                      selectedMember?.id === m.id 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-white border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      selectedMember?.id === m.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{m.name}</p>
                      <p className="text-xs font-medium text-gray-500 leading-tight mt-0.5">{m.dept}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className={cn("space-y-6", viewType === 'dept' ? "lg:col-span-3" : "lg:col-span-4")}>
              {(!selectedMember && viewType === 'dept') ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <Users size={48} className="text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-500">부서 인원을 선택하여 현황을 확인하세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title={selectedMember ? `${selectedMember.name}'s Checklist` : t('personal_task')}>
                    <div className="space-y-3">
                      {Object.entries(selectedMember?.progress || members[0].progress).map(([key, done]) => (
                        <button
                          key={key}
                          onClick={() => (viewType === 'my') && toggleCheck(selectedMember?.id || 1, key)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                            done 
                              ? "bg-blue-50/50 border-blue-100 text-blue-600" 
                              : "bg-gray-50 border-gray-100 text-gray-600",
                            viewType === 'my' && "cursor-pointer hover:bg-gray-100",
                            viewType === 'dept' && "cursor-default" 
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {done ? <CheckCircle2 size={20} className="text-blue-600" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                            <span className="font-bold text-sm">{key.replace('_', ' ')}</span>
                          </div>
                          {viewType === 'my' && <ChevronRight size={16} className="text-gray-400" />}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card title={t('perf_telemetry')}>
                      <div className="flex flex-col items-center justify-center p-4 space-y-6">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-gray-100 fill-none" strokeWidth="12" />
                            <motion.circle
                              cx="80" cy="80" r="70"
                              stroke="currentColor" strokeWidth="12" strokeDasharray="440"
                              initial={{ strokeDashoffset: 440 }}
                              animate={{ strokeDashoffset: 440 - (440 * (selectedMember?.total || 75) / 100) }}
                              className="text-blue-600 fill-none"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-gray-900">{selectedMember?.total || 75}%</span>
                            <span className="text-xs font-bold text-gray-500 mt-1">{t('compliance_rate')}</span>
                          </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 mb-1">{t('growth_node')}</p>
                            <p className="text-lg font-black text-gray-900">+2.5%</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 mb-1">{t('team_rank')}</p>
                            <p className="text-lg font-black text-gray-900">#04</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* GUIDE TAB (NotebookLM Chat) */}
        {activeTab === 'guide' && (
          <div className="lg:col-span-4 h-[600px] flex flex-col bg-[#1a1f2e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl relative">
             <div className="px-6 py-4 bg-[#232938] border-b border-gray-700 flex justify-between items-center z-10 shrink-0">
               <div className="flex items-start gap-4">
                  <div className="mt-1 text-white">
                     <MessageSquare size={24} className="fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-widest">NOTEBOOK LM GUIDE</h3>
                    <p className="text-xs font-medium text-gray-400 mt-1">온보딩 가이드 챗봇입니다. 무엇이든 물어보세요.</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <a href="https://notebooklm.google.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                     <ExternalLink size={16} />
                     NotebookLM 열기
                  </a>
                  <button onClick={() => setChatMessages([])} className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors">
                     대화 초기화
                  </button>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col bg-[#1a1f2e]">
                {chatMessages.map((msg, i) => (
                   <div key={i} className={cn("max-w-[75%] rounded-2xl p-5 text-sm font-medium leading-relaxed",
                      msg.role === 'user' ? "bg-blue-600 text-white self-end rounded-tr-sm shadow-sm" : 
                      msg.role === 'error' ? "bg-rose-500/20 text-rose-500 border border-rose-500/50 self-start" : 
                      "bg-[#2a3040] text-gray-200 self-start rounded-tl-sm shadow-md whitespace-pre-wrap"
                   )}>
                      {msg.text}
                   </div>
                ))}
                {isChatLoading && (
                   <div className="bg-[#2a3040] w-20 rounded-2xl p-4 self-start rounded-tl-sm flex items-center justify-center gap-1.5 shadow-md">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                   </div>
                )}
             </div>

             <div className="p-4 bg-[#232938] shrink-0 border-t border-gray-700">
                <div className="relative flex items-center mx-auto max-w-4xl">
                   <input
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                     placeholder="질문을 입력하세요..."
                     disabled={isChatLoading}
                     className="w-full p-4 pl-6 pr-16 bg-[#181c26] border border-gray-700 rounded-xl text-sm font-medium text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-50 shadow-inner"
                   />
                   <button 
                     onClick={handleSendChat}
                     disabled={isChatLoading || !chatInput.trim()}
                     className="absolute right-2 p-3 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50"
                   >
                     <Send size={18} />
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </PremiumPage>
  );
};
