import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Layers,
  Settings,
  Search,
  Maximize,
  Bell,
  MessageSquare,
  Zap,
  Cpu,
  Send,
  User,
  LogOut,
  X,
  Shield,
  Edit3,
  Mic,
  GraduationCap,
  Users,
  Check,
  BellOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation, LanguageProvider } from '../shared/Translations';
import { USER_ROLES, INITIAL_MEMBERS } from '../shared/MockData';
import { cn } from '../shared/utils';
import { LanguageToggle } from '../shared/SharedComponents';

// Import Tabs
import { LoginView } from '../1.Login/LoginView';
import { Dashboard } from '../2.Dashboard/Dashboard';
import { Onboarding } from '../3.Onboarding/Onboarding';
import { KnowledgeBase } from '../4.KnowledgeBase/KnowledgeBase';
import { Apps } from '../5.Apps/Apps';
import { SettingsPage } from '../6.Settings/SettingsPage';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo_dark.png';

const MainAppContent = () => {
  const { lang, setLang, t } = useTranslation();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: t('ai_greet') }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Update AI greeting when language changes
  useEffect(() => {
    setChatMessages(prev => [
      { role: 'ai', text: t('ai_greet') },
      ...prev.slice(1)
    ]);
  }, [lang, t]);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;
    
    const userMsg = inputMessage.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      // Provide context about the current page
      const pageLabel = getActiveLabel();
      const res = await fetch('/api/chat-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[현재 페이지: ${pageLabel}] ${userMsg}`,
          notebookUrl: "https://notebooklm.google.com/notebook/2d4b0ec8-fdc4-4655-af25-b33a94d92d2b?authuser=1"
        })
      });
      const data = await res.json();
      
      if (data.success) {
        let answerText = data.answer || '';
        // Basic cleanup of NLM artifacts
        answerText = answerText.replace(/EXTREMELY IMPORTANT:[\s\S]*/g, '').trim();
        setChatMessages(prev => [...prev, { role: 'ai', text: answerText }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: `죄송합니다. 답변을 생성하는 중 오류가 발생했습니다: ${data.error || 'Unknown Error'}` }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `통신 중 오류가 발생했습니다: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const addNotification = (text) => {
    setNotifications(prev => [
      { id: Date.now(), text, time: '방금 전', unread: true },
      ...prev
    ]);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const NAV_CATEGORIES = [
    {
      category: null,
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' }
      ]
    },
    {
      category: '온보딩',
      items: [
        { id: 'onboarding', icon: GraduationCap, label: '온보딩 포털' }
      ]
    },
    {
      category: '자료실',
      items: [
        { id: 'knowledge', icon: BookOpen, label: '자료실' }
      ]
    },
    {
      category: '기타',
      items: [
        { id: 'apps', icon: Layers, label: 'Apps' },
      ]
    },
    {
      category: '설정',
      items: [
        { id: 'settings', icon: Settings, label: '설정' }
      ]
    }
  ];

  // Map icons for simple usage
  const getActiveLabel = () => {
    for (const cat of NAV_CATEGORIES) {
      const found = cat.items.find(i => i.id === activeTab);
      if (found) return found.label;
    }
    return '';
  };

  return (
    <div className={cn(
      "min-h-screen font-sans flex transition-colors duration-500",
      theme === 'dark' ? "bg-[#0f172a] text-slate-100" : "bg-[#f9fafb] text-gray-800"
    )}>
      {!user ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <>
          {/* SIDEBAR */}
          <nav className={cn(
            "w-64 border-r flex flex-col py-6 z-40 fixed h-full shadow-sm transition-colors duration-500",
            theme === 'dark' ? "bg-[#1e293b] border-slate-800" : "bg-white border-gray-200"
          )}>
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="px-5 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="py-2 px-2 rounded-xl w-full flex justify-center transition-colors">
                <img 
                  src={theme === 'dark' ? logoDark : logo} 
                  alt="Suresoft Logo" 
                  className="h-[4.5rem] object-contain" 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6">
              {NAV_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  {cat.category && (
                    <p className="text-[10px] font-bold text-gray-400 pl-4 mb-1">{cat.category}</p>
                  )}
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none",
                        activeTab === item.id 
                          ? (theme === 'dark' ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") 
                          : (theme === 'dark' ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                      )}
                    >
                      {activeTab === item.id && (
                        <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-md" />
                      )}
                      <item.icon size={18} className={cn(activeTab === item.id ? "text-blue-600" : "text-gray-400")} />
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-auto px-4 space-y-4">
              <div className="px-2">
                <LanguageToggle theme={theme} />
              </div>
              <div className={cn(
                "rounded-xl p-4 flex items-center justify-between border transition-colors duration-500",
                theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col items-start">
                    <p className={cn(
                      "text-sm font-bold leading-tight",
                      theme === 'dark' ? "text-slate-100" : "text-gray-900"
                    )}>
                      {user.name}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {user.team} | {user.position}
                    </p>
                    {user.role === USER_ROLES.ADMIN && (
                      <span className="text-[8px] font-bold text-red-500 mt-0.5 tracking-wider uppercase">ADMIN</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setUser(null)}
                  title={t('logout')}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </nav>

          {/* MAIN LAYOUT */}
          <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
            {/* HEADER */}
            <header className={cn(
              "h-16 border-b flex items-center justify-between px-8 z-30 shrink-0 transition-colors duration-500",
              theme === 'dark' ? "bg-[#1e293b] border-slate-800" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center">
                <h2 className={cn(
                  "text-xl font-bold tracking-tight",
                  theme === 'dark' ? "text-slate-100" : "text-gray-900"
                )}>{getActiveLabel()}</h2>
              </div>

              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "p-2 rounded-full transition-all relative outline-none",
                    isNotificationsOpen 
                      ? (theme === 'dark' ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600") 
                      : (theme === 'dark' ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50")
                  )}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={cn(
                        "absolute top-12 right-0 w-80 rounded-2xl shadow-2xl border overflow-hidden z-[100] transition-colors duration-500",
                        theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "p-4 border-b flex items-center justify-between",
                        theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-100"
                      )}>
                        <span className={cn(
                          "text-sm font-black",
                          theme === 'dark' ? "text-slate-100" : "text-gray-900"
                        )}>알림 센터</span>
                        {notifications.length > 0 && (
                          <button 
                            onClick={clearAllNotifications}
                            className={cn(
                              "text-[10px] font-bold transition-colors uppercase tracking-widest",
                              theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            전체 삭제
                          </button>
                        )}
                      </div>

                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className={cn(
                            "divide-y",
                            theme === 'dark' ? "divide-slate-800/50" : "divide-gray-50"
                          )}>
                            {notifications.map((n) => (
                              <div 
                                key={n.id} 
                                className={cn(
                                  "p-4 transition-colors cursor-pointer group flex items-start gap-3",
                                  theme === 'dark' 
                                    ? (n.unread ? "bg-blue-900/10 hover:bg-slate-800" : "bg-slate-900 hover:bg-slate-800")
                                    : (n.unread ? "bg-blue-50/30 hover:bg-gray-50" : "bg-white hover:bg-gray-50")
                                )}
                                onClick={() => markAsRead(n.id)}
                              >
                                <div className={cn(
                                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                  n.unread ? "bg-blue-500" : (theme === 'dark' ? "bg-slate-700" : "bg-gray-200")
                                )} />
                                <div className="flex-1">
                                  <p className={cn(
                                    "text-xs leading-relaxed",
                                    n.unread 
                                      ? (theme === 'dark' ? "text-slate-100 font-bold" : "text-gray-900 font-bold") 
                                      : (theme === 'dark' ? "text-slate-400 font-medium" : "text-gray-500 font-medium")
                                  )}>
                                    {n.text}
                                  </p>
                                  <p className={cn(
                                    "text-[10px] mt-1 font-bold italic",
                                    theme === 'dark' ? "text-slate-500" : "text-gray-400"
                                  )}>{n.time}</p>
                                </div>
                                {n.unread && (
                                  <Check size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                            <div className={cn(
                              "p-4 rounded-full",
                              theme === 'dark' ? "bg-slate-800 text-slate-500" : "bg-gray-50 text-gray-300"
                            )}>
                              <BellOff size={32} />
                            </div>
                            <p className={cn(
                              "text-[11px] font-bold",
                              theme === 'dark' ? "text-slate-500" : "text-gray-400"
                            )}>새로운 알림이 없습니다.</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Integrated v4.2</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 overflow-y-auto p-8 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                   {activeTab === 'dashboard' && <Dashboard user={user} theme={theme} members={members} />}
                  {activeTab === 'onboarding' && (
                    <Onboarding
                      user={user}
                      members={members}
                      setMembers={setMembers}
                      addNotification={addNotification}
                      theme={theme}
                    />
                  )}
                  {activeTab === 'knowledge' && <KnowledgeBase theme={theme} />}
                  {activeTab === 'apps' && <Apps user={user} addNotification={addNotification} theme={theme} />}
                  {activeTab === 'settings' && <SettingsPage user={user} theme={theme} toggleTheme={toggleTheme} onLogout={() => setUser(null)} />}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* NEURAL CO-PILOT */}
          <button
            onClick={() => setIsCoPilotOpen(!isCoPilotOpen)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:scale-110 active:scale-95 transition-all outline-none"
          >
            <MessageSquare size={24} />
          </button>

          <AnimatePresence>
            {isCoPilotOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed bottom-28 right-8 w-96 h-[550px] bg-white rounded-3xl p-0 flex flex-col z-50 overflow-hidden shadow-2xl border border-gray-200"
              >
                <div className="p-5 bg-white border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{t('copilot_title')}</h3>
                      <p className="text-[10px] text-gray-500 font-medium">{t('copilot_sub')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCoPilotOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[85%] p-3.5 text-sm font-medium leading-relaxed rounded-2xl shadow-sm",
                        msg.role === 'user'
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex flex-col items-start">
                      <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm p-4 flex gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('init_cmd')}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-blue-600 p-2 hover:bg-blue-700 rounded-xl transition-colors outline-none"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export const MainApp = () => {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
};
