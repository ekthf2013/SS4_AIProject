import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, CheckCircle2, ChevronRight, MessageSquare, TrendingUp, BookOpen, BarChart2, GraduationCap, Mic, ExternalLink, Send, Activity, RotateCw, MapPin, Calendar, Link2, Filter, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { USER_ROLES, CHECKLIST_CONFIG, CONFERENCE_DATA, CONFERENCE_SEARCH_TOPICS } from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';
import { fetchAndOrganizeConferences } from '../services/conferenceService';
export const Onboarding = ({ user, members, setMembers, addNotification, theme }) => {
  const { t } = useTranslation();
  const role = user?.role;
  const [mainTab, setMainTab] = useState('guide'); // 'guide', 'onboarding', 'growth'
  const [subTab, setSubTab] = useState('my'); // 'my', 'dept' for onboarding, 'edu', 'conf' for growth
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedStatGroupIdx, setSelectedStatGroupIdx] = useState(null);

  const viewType = (mainTab === 'onboarding' && subTab === 'dept') ? 'dept' : 'my';

  // Expanded Categories State for Checklist
  const [expandedCategories, setExpandedCategories] = useState([0]); // Default first category open

  const toggleCategory = (idx) => {
    setExpandedCategories(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Chat Guide States
  const [chatMessages, setChatMessages] = useState([
     { role: 'ai', text: '안녕하세요! SDV 시스템 부문 온보딩 가이드 챗봇입니다. 시스템 설정, 교육 과정, 사내 문화 등 궁금한 점을 입력해 주세요.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Conference Filtering
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedConferenceTags, setSelectedConferenceTags] = useState([]); // Empty = ALL
  const [conferenceTypeTab, setConferenceTypeTab] = useState('domestic'); // 'domestic' or 'global'
  
  // Conference Live Data State
  const [liveConferences, setLiveConferences] = useState(CONFERENCE_DATA);
  const [geminiApiKey, setGeminiApiKey] = useState(''); 

  // Google Sheets Integration State
  const [sheetsApiUrl, setSheetsApiUrl] = useState(localStorage.getItem('google_sheets_url') || 'https://script.google.com/macros/s/AKfycbzS6wF09hgkKKojqe4uj3wQ6JUT2UA0CpgVDKop4e7-Umfl7vo5f9aEYekkKZkfBDlVpA/exec');
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [internalTraining, setInternalTraining] = useState([]);
  const [isTrainingLoading, setIsTrainingLoading] = useState(false);
  const [newTraining, setNewTraining] = useState({ title: '', date: '', instructor: '', tag: '일반' });

  // 1. Fetch Training from Google Sheets
  const fetchTrainingFromSheets = async () => {
    if (!sheetsApiUrl) {
      // Fallback if no URL
      setInternalTraining([
        { id: 1, title: 'SW 아키텍처 기본 (로컬)', date: '2026-04-10', instructor: '김철수 책임', tag: '필수' },
      ]);
      return;
    }
    
    setIsTrainingLoading(true);
    try {
      const response = await fetch(sheetsApiUrl);
      const data = await response.json();
      setInternalTraining(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsTrainingLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'growth' && subTab === 'edu') {
      fetchTrainingFromSheets();
    }
  }, [mainTab, subTab, sheetsApiUrl]);

  // 2. Add Training to Google Sheets
  const handleAddTraining = async () => {
    if (!newTraining.title || !newTraining.date || !newTraining.instructor) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    const payload = { 
      action: 'add', 
      ...newTraining, 
      id: Date.now().toString() 
    };

    if (sheetsApiUrl) {
      try {
        await fetch(sheetsApiUrl, {
          method: 'POST',
          mode: 'no-cors', // GAS simple POST
          body: JSON.stringify(payload)
        });
        addNotification(`[교육] 새로운 교육 과정 "${newTraining.title}"이(가) 등록되었습니다.`);
        setTimeout(fetchTrainingFromSheets, 1000); // Wait for GAS sync
      } catch (err) {
        alert("시트 업데이트 중 오류가 발생했습니다.");
      }
    } else {
      setInternalTraining(prev => [...prev, payload]);
      addNotification(`[교육] 새로운 교육 과정 "${newTraining.title}"이(가) 등록되었습니다.`);
    }
    
    setNewTraining({ title: '', date: '', instructor: '', tag: '일반' });
  };

  // 3. Remove Training from Google Sheets
  const handleRemoveTraining = async (id) => {
    if (!confirm("해당 교육 과정을 삭제하시겠습니까?")) return;

    if (sheetsApiUrl) {
      try {
        await fetch(sheetsApiUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'delete', id: id.toString() })
        });
        setTimeout(fetchTrainingFromSheets, 1000);
      } catch (err) {
        alert("시트 업데이트 중 오류가 발생했습니다.");
      }
    } else {
      setInternalTraining(prev => prev.filter(t => t.id !== id));
    }
  };

  const allConferenceTags = useMemo(() => {
    const tags = new Set();
    liveConferences.forEach(conf => conf.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [liveConferences]);

  const toggleConferenceTag = (tag) => {
    setSelectedConferenceTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleCheck = (memberId, key, label) => {
    // 1. 대상 멤버 찾기
    const member = members.find(m => m.userId === memberId || m.id === memberId);
    if (!member) return;

    // 2. 완료 여부 판단
    const isComplete = !member.progress[key];

    // 3. 알림 전송 (매니저 계정만, 중복 방지를 위해 상태 업데이트 외부에서 실행)
    if (isComplete && (role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN)) {
      addNotification(`[온보딩] ${member.name}님이 "${label}" 항목을 완료했습니다!`);
    }

    // 4. 상태 업데이트
    setMembers(prev => prev.map(m => {
      if (m.userId === memberId || m.id === memberId) {
        const newProgress = { ...m.progress, [key]: isComplete };
        // Recalculate total
        const values = Object.values(newProgress);
        const newTotal = Math.round((values.filter(v => v).length / values.length) * 100);
        return { ...m, progress: newProgress, total: newTotal };
      }
      return m;
    }));
  };

  const filteredMembers = useMemo(() => {
    if (viewType === 'my') return members.filter(m => m.userId === user?.id); 
    // If manager/admin looking at dept, filter by their team
    return members.filter(m => m.dept === user?.team && m.userId !== user?.id);
  }, [members, viewType, user]);

  const teamStats = useMemo(() => {
    if (viewType !== 'dept' || filteredMembers.length === 0) return null;
    
    const count = filteredMembers.length;
    const avg = Math.round(filteredMembers.reduce((acc, m) => acc + (m.total || 0), 0) / count);
    const completed = filteredMembers.filter(m => m.total === 100).length;
    
    // Calculate category-specific avg
    const catAverages = CHECKLIST_CONFIG.map(group => {
      const groupProgress = filteredMembers.reduce((acc, m) => {
        const doneCount = group.items.filter(item => m.progress?.[item.id]).length;
        return acc + (doneCount / group.items.length);
      }, 0);
      return { 
        name: group.category, 
        avg: Math.round((groupProgress / count) * 100) 
      };
    });

    return { count, avg, completed, catAverages };
  }, [filteredMembers, viewType]);

  useEffect(() => {
    if (viewType === 'my') setSelectedMember(members.find(m => m.userId === user?.id));
    else setSelectedMember(null);
  }, [viewType, members, user]);

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
    <PremiumPage theme={theme}>
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 pb-6 border-b transition-colors duration-500",
        theme === 'dark' ? "border-slate-800" : "border-gray-100"
      )}>
        <div className="flex flex-col gap-1">
          <h1 className={cn(
            "text-4xl font-black tracking-tight mb-1 transition-colors duration-500",
            theme === 'dark' ? "text-slate-100" : "text-gray-900"
          )}>{t('onboarding_title')}</h1>
          <p className="text-sm font-bold text-gray-400">{t('onboarding_sub')}</p>
        </div>

        <div className="flex flex-col items-end gap-4">
          {/* Main Top Hierarchy Tabs - Moved to Header Right */}
          <div className={cn(
            "flex items-center gap-1 p-1.5 rounded-2xl shadow-sm border transition-colors duration-500",
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
          )}>
            {[
              { id: 'guide', label: '가이드', icon: BookOpen },
              { id: 'onboarding', label: '온보딩', icon: User },
              { id: 'growth', label: '성장', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setMainTab(tab.id);
                  if (tab.id === 'onboarding') setSubTab('my');
                  if (tab.id === 'growth') setSubTab('edu');
                }}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2.5 outline-none",
                  mainTab === tab.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105" 
                    : (theme === 'dark' ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub Tabs based on Main Tab Selection - Moved high up next to main tabs */}
          <AnimatePresence mode="wait">
            {(mainTab === 'onboarding' || mainTab === 'growth') && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex items-center gap-1 p-1 rounded-xl border transition-colors",
                  theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-gray-50/50 p-1 rounded-xl border border-gray-100"
                )}
              >
                {mainTab === 'onboarding' && (
                  <>
                    <button
                      onClick={() => setSubTab('my')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                        subTab === 'my' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                      )}
                    >
                      나의 현황
                    </button>
                    {(role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN) && (
                      <button
                        onClick={() => setSubTab('dept')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                          subTab === 'dept' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                        )}
                      >
                        부서 현황
                      </button>
                    )}
                  </>
                )}
                {mainTab === 'growth' && (
                  <>
                    {(subTab === 'edu' && (role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN)) && (
                      <button 
                        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                        className={cn(
                          "mr-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border",
                          isConfigExpanded ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        <Link2 size={12} />
                        설정 {isConfigExpanded ? "닫기" : "열기"}
                      </button>
                    )}
                    <button
                      onClick={() => setSubTab('edu')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                        subTab === 'edu' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                      )}
                    >
                       {t('tab_education')}
                    </button>
                    <button
                      onClick={() => setSubTab('conf')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                        subTab === 'conf' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                      )}
                    >
                      컨퍼런스
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ONBOARDING CONTENT (나의 현황 / 부서 현황) */}
        {mainTab === 'onboarding' && (
          <>
            {/* Personnel List (Visible in Dept mode) */}
            {viewType === 'dept' && (
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider pl-1 mb-2">부서 인원</h4>
                {filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card theme={theme}>
                      <div className="flex flex-col items-center justify-center p-4">
                        <Users size={32} className="text-blue-500 mb-2" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('total_members') || '전체 팀원'}</p>
                        <p className={cn(
                          "text-3xl font-black mt-1",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>{teamStats?.count}명</p>
                      </div>
                    </Card>
                    <Card theme={theme}>
                      <div className="flex flex-col items-center justify-center p-4">
                        <TrendingUp size={32} className="text-green-500 mb-2" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('avg_progress') || '평균 진척률'}</p>
                        <p className={cn(
                          "text-3xl font-black mt-1",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>{teamStats?.avg}%</p>
                      </div>
                    </Card>
                    <Card theme={theme}>
                      <div className="flex flex-col items-center justify-center p-4">
                        <CheckCircle2 size={32} className="text-indigo-500 mb-2" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('completed_members') || '완료 인원'}</p>
                        <p className={cn(
                          "text-3xl font-black mt-1",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>{teamStats?.completed}명</p>
                      </div>
                    </Card>
                  </div>

                  <Card title="카테고리별 온보딩 현황" theme={theme}>
                    <div className="space-y-6">
                      {teamStats?.catAverages.map((cat, idx) => (
                        <div key={idx} className="space-y-3">
                          <button 
                            onClick={() => setSelectedStatGroupIdx(selectedStatGroupIdx === idx ? null : idx)}
                            className="w-full text-left outline-none group"
                          >
                            <div className="flex justify-between items-center px-1 mb-2">
                              <span className={cn(
                                "text-xs font-black uppercase tracking-wider transition-colors",
                                selectedStatGroupIdx === idx ? "text-blue-600" : (theme === 'dark' ? "text-slate-300 group-hover:text-blue-400" : "text-gray-600 group-hover:text-blue-600")
                              )}>{cat.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400">{selectedStatGroupIdx === idx ? '접기' : '자세히 보기'}</span>
                                <span className="text-xs font-black text-blue-600">{cat.avg}%</span>
                              </div>
                            </div>
                            <div className={cn(
                              "h-2.5 rounded-full overflow-hidden transition-all",
                              theme === 'dark' ? "bg-slate-800" : "bg-gray-100",
                              selectedStatGroupIdx === idx && "ring-2 ring-blue-600/20"
                            )}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.avg}%` }}
                                className="h-full bg-blue-600 rounded-full shadow-sm"
                              />
                            </div>
                          </button>

                          {/* INCOMPLETE PERSONNEL LIST FOR SELECTED CATEGORY */}
                          <AnimatePresence>
                            {selectedStatGroupIdx === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className={cn(
                                  "mt-2 p-4 rounded-2xl space-y-4 border transition-colors",
                                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"
                                )}>
                                  {CHECKLIST_CONFIG[idx].items.map(item => {
                                    const incompletePeople = filteredMembers.filter(m => !m.progress?.[item.id]);
                                    return (
                                      <div key={item.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                                          <span className={cn(
                                            "text-xs font-bold",
                                            theme === 'dark' ? "text-slate-200" : "text-gray-700"
                                          )}>{item.label}</span>
                                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md ml-auto">
                                            미완료 {incompletePeople.length}명
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pl-3">
                                          {incompletePeople.length > 0 ? (
                                            incompletePeople.map(person => (
                                              <div 
                                                key={person.id} 
                                                className={cn(
                                                  "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border",
                                                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-100 text-gray-500"
                                                )}
                                              >
                                                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px]">
                                                  {person.name.charAt(0)}
                                                </div>
                                                {person.name}
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-[10px] text-gray-400 italic pl-1">모두 완료했습니다! ✨</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <div className={cn(
                    "p-6 rounded-3xl border border-dashed flex items-center justify-center gap-4 transition-colors",
                    theme === 'dark' ? "bg-slate-800/30 border-slate-700" : "bg-blue-50/50 border-blue-100"
                  )}>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <BarChart2 size={20} />
                    </div>
                    <p className={cn(
                      "text-sm font-bold",
                      theme === 'dark' ? "text-slate-400" : "text-gray-600"
                    )}>
                      왼쪽 리스트에서 특정 팀원을 선택하면 상세 체크리스트를 확인하고 관리할 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title={selectedMember ? `${selectedMember.name}'s Checklist` : t('personal_task')} theme={theme}>
                    <div className="space-y-4">
                      {CHECKLIST_CONFIG.map((group, gIdx) => {
                        const isExpanded = expandedCategories.includes(gIdx);
                        const groupItems = group.items;
                        const completedCount = groupItems.filter(item => selectedMember?.progress?.[item.id]).length;
                        
                        return (
                          <div key={gIdx} className={cn(
                            "border rounded-2xl overflow-hidden shadow-sm transition-colors duration-500",
                            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
                          )}>
                            <button 
                              onClick={() => toggleCategory(gIdx)}
                              className={cn(
                                "w-full flex items-center justify-between p-4 transition-colors",
                                theme === 'dark' ? "bg-slate-800/50 hover:bg-slate-700" : "bg-gray-50/50 hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <h4 className={cn(
                                  "text-xs font-black uppercase tracking-widest leading-none",
                                  theme === 'dark' ? "text-slate-100" : "text-gray-900"
                                )}>{group.category}</h4>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                  {completedCount} / {groupItems.length}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                {isExpanded ? <Activity size={14} className="text-blue-500 animate-pulse" /> : <ChevronRight size={14} />}
                              </div>
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 pt-2 grid gap-2">
                                    {groupItems.map((item) => {
                                      const done = selectedMember?.progress?.[item.id];
                                      return (
                                        <button
                                          key={item.id}
                                          onClick={() => (viewType === 'my') && toggleCheck(selectedMember?.userId || user?.id, item.id, item.label)}
                                          className={cn(
                                            "w-full flex items-center justify-between p-3.5 rounded-xl border transition-all",
                                            done 
                                              ? (theme === 'dark' ? "bg-blue-600/10 border-blue-500/50 text-blue-400" : "bg-blue-50/20 border-blue-100 text-blue-600") 
                                              : (theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-white border-gray-100 text-gray-600"),
                                            viewType === 'my' && (theme === 'dark' ? "cursor-pointer hover:border-blue-500" : "cursor-pointer hover:border-blue-200 hover:shadow-sm"),
                                            viewType === 'dept' && "cursor-default opacity-80" 
                                          )}
                                        >
                                          <div className="flex items-center gap-3">
                                            {done ? <CheckCircle2 size={16} className="text-blue-600" /> : <div className={cn(
                                              "w-3.5 h-3.5 rounded-full border-2",
                                              theme === 'dark' ? "border-slate-700" : "border-gray-200"
                                            )} />}
                                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                          </div>
                                          {viewType === 'my' && !done && <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card title={t('perf_telemetry')} theme={theme}>
                      <div className="flex flex-col items-center justify-center p-4 space-y-6">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-gray-100 fill-none" strokeWidth="12" />
                            <motion.circle
                              cx="80" cy="80" r="70"
                              stroke="currentColor" strokeWidth="12" strokeDasharray="440"
                              initial={{ strokeDashoffset: 440 }}
                              animate={{ strokeDashoffset: 440 - (440 * (selectedMember?.total ?? 0) / 100) }}
                              className="text-blue-600 fill-none"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn(
                              "text-3xl font-black",
                              theme === 'dark' ? "text-slate-100" : "text-gray-900"
                            )}>{selectedMember?.total ?? 0}%</span>
                            <span className="text-xs font-bold text-gray-500 mt-1">{t('compliance_rate')}</span>
                          </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                          <div className={cn(
                            "p-4 rounded-2xl text-center border transition-colors",
                            theme === 'dark' ? "bg-blue-900/20 border-blue-800/50" : "bg-blue-50 border-blue-100"
                          )}>
                            <p className="text-xs font-bold text-blue-600 mb-1">{t('growth_node')}</p>
                            <p className={cn(
                              "text-lg font-black",
                              theme === 'dark' ? "text-slate-100" : "text-gray-900"
                            )}>+2.5%</p>
                          </div>
                          <div className={cn(
                            "p-4 rounded-2xl text-center border transition-colors",
                            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
                          )}>
                            <p className="text-xs font-bold text-gray-500 mb-1">{t('team_rank')}</p>
                            <p className={cn(
                              "text-lg font-black",
                              theme === 'dark' ? "text-slate-100" : "text-gray-900"
                            )}>#04</p>
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
        {mainTab === 'guide' && (
          <div className={cn(
            "lg:col-span-4 h-[600px] flex flex-col border rounded-2xl overflow-hidden shadow-xl relative transition-colors duration-500",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"
          )}>
             <div className={cn(
               "px-6 py-4 border-b flex justify-between items-center z-10 shrink-0 transition-colors duration-500",
               theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
             )}>
               <div className="flex items-start gap-4">
                  <div className={cn("mt-1", theme === 'dark' ? "text-white" : "text-blue-600")}>
                     <MessageSquare size={24} className="fill-current" />
                  </div>
                  <div>
                    <h3 className={cn("text-lg font-black tracking-widest transition-colors", theme === 'dark' ? "text-white" : "text-gray-900")}>NOTEBOOK LM GUIDE</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">온보딩 가이드 챗봇입니다. 무엇이든 물어보세요.</p>
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
             
             <div className={cn("flex-1 overflow-y-auto p-8 space-y-6 flex flex-col transition-colors duration-500", theme === 'dark' ? "bg-slate-900" : "bg-white")}>
                {chatMessages.map((msg, i) => (
                   <div key={i} className={cn("max-w-[75%] rounded-2xl p-5 text-sm font-medium leading-relaxed",
                      msg.role === 'user' ? "bg-blue-600 text-white self-end rounded-tr-sm shadow-sm" : 
                      msg.role === 'error' ? "bg-rose-500/20 text-rose-500 border border-rose-500/50 self-start" : 
                      (theme === 'dark' ? "bg-slate-800 text-slate-200 self-start rounded-tl-sm shadow-md whitespace-pre-wrap" : "bg-gray-100 text-gray-800 self-start rounded-tl-sm shadow-sm whitespace-pre-wrap")
                   )}>
                      {msg.text}
                   </div>
                ))}
                {isChatLoading && (
                   <div className={cn("w-20 rounded-2xl p-4 self-start rounded-tl-sm flex items-center justify-center gap-1.5 shadow-md", theme === 'dark' ? "bg-slate-800" : "bg-gray-100")}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                   </div>
                )}
             </div>

             <div className={cn("p-4 shrink-0 border-t transition-colors duration-500", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200")}>
                <div className="relative flex items-center mx-auto max-w-4xl">
                   <input
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                     placeholder="질문을 입력하세요..."
                     disabled={isChatLoading}
                     className={cn("w-full p-4 pl-6 pr-16 rounded-xl text-sm font-medium outline-none border transition-colors disabled:opacity-50 shadow-inner", theme === 'dark' ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-blue-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500")}
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

        {/* EDUCATION TAB (Growth Sub-tab) */}
        {mainTab === 'growth' && subTab === 'edu' && (
          <>


          <div className="lg:col-span-4 space-y-6">
            {/* Manager: Config & Add Training UI */}
            {(role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN) && (
              <div className="space-y-4">

                <AnimatePresence>
                  {isConfigExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-600/5 border border-blue-100 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <Link2 size={16} className="text-blue-600" />
                          <span className="text-xs font-black text-gray-700">구글 시트 연동 URL</span>
                        </div>
                        <input 
                          type="password"
                          value={sheetsApiUrl}
                          onChange={e => {
                            setSheetsApiUrl(e.target.value);
                            localStorage.setItem('google_sheets_url', e.target.value);
                          }}
                          placeholder="배포된 웹 앱 URL을 입력하세요 (https://script.google.com/...)"
                          className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-medium outline-none focus:border-blue-500 shadow-inner"
                        />
                        <button 
                          onClick={fetchTrainingFromSheets}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
                        >
                          <RotateCw size={12} className={cn(isTrainingLoading && "animate-spin")} />
                          새로고침
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className="p-6 border-dashed border-2 border-gray-200 bg-gray-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <Plus size={18} className="text-blue-600" />
                  <h3 className="text-sm font-black text-gray-900">새 교육 과정 등록 (관리자전용)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">제목</label>
                    <input 
                      type="text" 
                      value={newTraining.title}
                      onChange={e => setNewTraining(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="아키텍처 기본" 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">일시</label>
                    <input 
                      type="date" 
                      value={newTraining.date}
                      onChange={e => setNewTraining(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">강사</label>
                    <input 
                      type="text" 
                      value={newTraining.instructor}
                      onChange={e => setNewTraining(prev => ({ ...prev, instructor: e.target.value }))}
                      placeholder="강남수 수석" 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">구분</label>
                    <select 
                      value={newTraining.tag}
                      onChange={e => setNewTraining(prev => ({ ...prev, tag: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    >
                      <option value="일반">일반</option>
                      <option value="필수">필수</option>
                      <option value="심화">심화</option>
                      <option value="전문">전문</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button 
                      onClick={handleAddTraining}
                      className="w-full py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                    >
                      추가하기
                    </button>
                  </div>
                </div>
              </Card>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isTrainingLoading ? (
                <div className="col-span-3 py-20 flex justify-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {internalTraining.map((edu) => (
                    <Card key={edu.id} theme={theme} className="hover:shadow-md transition-shadow relative group">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <span className={cn(
                            "px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider",
                            theme === 'dark' ? "bg-blue-900/40 text-blue-400" : "bg-blue-50 text-blue-600"
                          )}>{edu.tag}</span>
                          <div className="flex items-center gap-2">
                            {(role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN) && (
                              <button 
                                onClick={() => handleRemoveTraining(edu.id)}
                                className="p-1.5 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <GraduationCap size={20} className="text-gray-300" />
                          </div>
                        </div>
                        <h3 className={cn(
                          "text-lg font-bold mb-2",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>{edu.title || edu.Title || '소속/교육명 없음'}</h3>
                        <div className={cn(
                          "mt-auto pt-4 border-t flex justify-between items-center",
                          theme === 'dark' ? "border-slate-800" : "border-gray-50"
                        )}>
                          <div className="text-xs text-gray-500">
                            <p className="font-bold">{edu.instructor || edu.Instructor || '강사 미지정'}</p>
                            <p>{edu.date ? (new Date(edu.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })) : '일정 미정'}</p>
                          </div>
                          <button className="text-xs font-bold text-blue-600 hover:underline">신청하기</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {internalTraining.length === 0 && (
                    <div className={cn(
                      "col-span-1 md:col-span-3 py-20 flex flex-col items-center justify-center rounded-2xl border border-dashed",
                      theme === 'dark' ? "bg-slate-800/20 border-slate-700" : "bg-gray-50/50 border-gray-200"
                    )}>
                      <GraduationCap size={48} className="text-gray-300 mb-4" />
                      <p className="text-sm font-bold text-gray-400">등록된 교육 과정이 없습니다.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </>
        )}

        {/* CONFERENCE TAB (Growth Sub-tab) */}
        {mainTab === 'growth' && subTab === 'conf' && (
          <div className="lg:col-span-4 space-y-6">
            <div className={cn(
              "border rounded-2xl shadow-sm overflow-hidden transition-colors duration-500",
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
            )}>
              <div className={cn(
                "flex flex-col sm:flex-row justify-between items-center p-4 gap-4",
                theme === 'dark' ? "bg-slate-800/50" : "bg-gray-50/50"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex p-1 rounded-xl border transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-gray-100 border-gray-200"
                  )}>
                    {[
                      { id: 'domestic', label: '국내 행사' },
                      { id: 'global', label: '해외 행사' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setConferenceTypeTab(tab.id)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                          conferenceTypeTab === tab.id 
                            ? (theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-sm" : "bg-white text-blue-600 shadow-sm") 
                            : "text-gray-500 hover:text-gray-800"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        isFilterExpanded 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                          : (theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300")
                      )}
                    >
                      <Filter size={14} />
                      키워드 상세 선택
                      {selectedConferenceTags.length > 0 && (
                        <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-md text-[10px] ml-1">
                          {selectedConferenceTags.length}
                        </span>
                      )}
                    </button>
                    {selectedConferenceTags.length > 0 && (
                      <button 
                        onClick={() => setSelectedConferenceTags([])}
                        className="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if (!geminiApiKey) {
                      const key = prompt("AI 정제를 위해 Gemini API Key를 입력해주세요. (없을 경우 취소를 누르면 시뮬레이션으로 진행됩니다)");
                      if (!key) {
                        alert("시뮬레이션 모드로 진행합니다.");
                        setIsChatLoading(true);
                        setTimeout(() => {
                          setIsChatLoading(false);
                          alert("AI 에이전트(저)와의 대화창에 '갱신해줘'라고 요청하시면 제가 데이터를 직접 업데이트해 드립니다.");
                        }, 1000);
                        return;
                      }
                      setGeminiApiKey(key);
                    }

                    setIsChatLoading(true);
                    try {
                      const now = new Date();
                      const newData = await fetchAndOrganizeConferences(
                        geminiApiKey || prompt("Gemini API Key를 입력해주세요"), 
                        CONFERENCE_SEARCH_TOPICS, 
                        now.getFullYear()
                      );
                      setLiveConferences(newData);
                      addNotification(`[컨퍼런스] 최신 컨퍼런스 데이터 ${newData.length}건이 동기화되었습니다.`);
                      alert("실시간 검색 및 AI 정제가 완료되었습니다!");
                    } catch (err) {
                      console.error("Refresh Error:", err);
                      const errorMsg = err.response?.data?.error?.message || err.message;
                      alert(`갱신 중 오류가 발생했습니다: ${errorMsg}\n\n도움말: API 키가 올바른지 확인하시거나, 키가 없다면 취소를 눌러 '에이전트 요청 모드'로 진행해 주세요.`);
                    } finally {
                      setIsChatLoading(false);
                    }
                  }}
                  disabled={isChatLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-none rounded-xl text-xs font-black text-white hover:shadow-lg hover:shadow-blue-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RotateCw size={14} className={cn(isChatLoading && "animate-spin")} />
                  {isChatLoading ? "AI 싱크 중..." : "AI 실시간 갱신"}
                </button>
              </div>

              <AnimatePresence>
                {/* ... existing filter content ... */}
                {isFilterExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={cn(
                      "border-t transition-colors",
                      theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-white border-gray-50"
                    )}
                  >
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      <button
                        onClick={() => setSelectedConferenceTags([])}
                        className={cn(
                          "flex items-center justify-center p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          selectedConferenceTags.length === 0 
                            ? (theme === 'dark' ? "bg-blue-900/40 border-blue-800 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600") 
                            : (theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200")
                        )}
                      >
                        ALL
                      </button>
                      {allConferenceTags.map(tag => {
                        const isSelected = selectedConferenceTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleConferenceTag(tag)}
                            className={cn(
                              "flex items-center justify-center p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                              isSelected 
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                                : (theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600")
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const filtered = liveConferences
                  .filter(conf => {
                    const isFuture = new Date(conf.date) >= new Date().setHours(0,0,0,0);
                    const matchesTag = selectedConferenceTags.length === 0 || 
                                     conf.tags.some(t => selectedConferenceTags.includes(t));
                    const matchesType = conf.type === conferenceTypeTab;
                    return isFuture && matchesTag && matchesType;
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (filtered.length === 0) {
                  return (
                    <div className={cn(
                      "col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center rounded-2xl border border-dashed",
                      theme === 'dark' ? "bg-slate-800/20 border-slate-700" : "bg-gray-50/50 border-gray-200"
                    )}>
                      <Calendar size={48} className="text-gray-300 mb-4" />
                      <p className="text-sm font-bold text-gray-400">일치하는 행사 정보가 없습니다.</p>
                      <button 
                        onClick={() => { setSelectedConferenceTags([]); setConferenceTypeTab('domestic'); }}
                        className="mt-4 text-xs font-black text-blue-600 hover:underline"
                      >
                        필터 초기화
                      </button>
                    </div>
                  );
                }

                return filtered.map((conf, cIdx) => (
                  <motion.div
                    key={conf.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: cIdx * 0.1 }}
                  >
                  <Card theme={theme} className="group hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden p-6">
                    <div className="flex gap-6 items-start">
                      {/* Date Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">{new Date(conf.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black">{new Date(conf.date).getDate()}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div className="flex flex-wrap gap-2">
                            {conf.tags.map(tag => (
                              <span key={tag} className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
                                theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-500"
                              )}>{tag}</span>
                            ))}
                          </div>
                          <a 
                            href={conf.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={cn(
                              "shrink-0 p-2 rounded-xl transition-all border border-transparent",
                              theme === 'dark' 
                                ? "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600" 
                                : "bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                            )}
                            title="홈페이지 방문"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        <h3 className={cn(
                          "text-lg font-black mb-2 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>
                          {conf.title}
                        </h3>
                        <p className={cn(
                          "text-sm font-medium mb-4 line-clamp-2 leading-relaxed transition-colors",
                          theme === 'dark' ? "text-slate-400" : "text-gray-500"
                        )}>
                          {conf.desc}
                        </p>
                        
                        <div className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-bold border-t pt-4 transition-colors",
                          theme === 'dark' ? "text-slate-500 border-slate-800" : "text-gray-400 border-gray-50"
                        )}>
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500/50" /> {conf.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500/50" /> {conf.date}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                ));
              })()}
            </div>
          </div>
        )}

      </div>
    </PremiumPage>
  );
};
