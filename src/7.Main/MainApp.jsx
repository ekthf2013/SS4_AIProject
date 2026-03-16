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
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation, LanguageProvider } from '../shared/Translations';
import { USER_ROLES } from '../shared/MockData';
import { cn } from '../shared/utils';
import { LanguageToggle } from '../shared/SharedComponents';

// Import Tabs
import { LoginView } from '../1.Login/LoginView';
import { Dashboard } from '../2.Dashboard/Dashboard';
import { Onboarding } from '../3.Onboarding/Onboarding';
import { KnowledgeBase } from '../4.KnowledgeBase/KnowledgeBase';
import { Apps } from '../5.Apps/Apps';
import { SettingsPage } from '../6.Settings/SettingsPage';

const MainAppContent = () => {
  const { lang, setLang, t } = useTranslation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: t('ai_greet') }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Update AI greeting when language changes
  useEffect(() => {
    setChatMessages(prev => [
      { role: 'ai', text: t('ai_greet') },
      ...prev.slice(1)
    ]);
  }, [lang, t]);

  const handleLogin = (id) => {
    setUser({ id, role: id === 'admin' ? USER_ROLES.ADMIN : USER_ROLES.MANAGER });
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: inputMessage.toUpperCase() }]);
    setInputMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: t('ai_proc') }]);
    }, 1000);
  };

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
        { id: 'onboarding', icon: GraduationCapIcon, label: '온보딩 포털' }
      ]
    },
    {
      category: '지식베이스',
      items: [
        { id: 'knowledge', icon: BookOpen, label: '자료실' },
        { id: 'exam', icon: Edit3, label: 'Exam Node' }
      ]
    },
    {
      category: null,
      items: [
        { id: 'apps', icon: LayoutGridIcon, label: 'Apps' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  // Map icons for simple usage
  function GraduationCapIcon(props) {
    return (
       <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a2 2 0 0 1-.019 3.837l-9.28 3.093a2 2 0 0 1-1.242 0l-9.28-3.093a2 2 0 0 1-.019-3.837l9.28-3.093a2 2 0 0 1 1.242 0z"/><path d="M14 22v-6.53"/><path d="M10 22v-6.53"/><path d="M12 22v-6.53"/><path d="M10 22h4"/></svg>
    ) // Actually just use lucide-react GraduationCap if we had it, but this is a fallback.
  }
  function LayoutGridIcon(props) {
     return <Layers {...props} />;
  }

  const getActiveLabel = () => {
    for (const cat of NAV_CATEGORIES) {
      const found = cat.items.find(i => i.id === activeTab);
      if (found) return found.label;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 flex font-sans">
      {!user ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <>
          {/* SIDEBAR */}
          <nav className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 z-40 fixed h-full shadow-sm">
            <div className="flex items-center gap-2 px-6 mb-8 cursor-pointer">
              <Shield className="text-blue-600 outline-none" size={24} fill="currentColor" />
              <span className="text-xl font-black text-blue-600 tracking-tight">SDV System</span>
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
                          ? "bg-blue-50 text-blue-600" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
                 <LanguageToggle />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.id === 'admin' ? 'H' : 'U'}
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                       {user.id === 'admin' ? 'hjsong' : 'User'}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                       {user.role === USER_ROLES.ADMIN ? 'Admin' : 'Manager'}
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
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30 shrink-0">
              <div className="flex items-center">
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getActiveLabel()}</h2>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                  <Bell size={20} />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
              </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'onboarding' && <Onboarding role={user.role} />}
                  {activeTab === 'knowledge' && <KnowledgeBase />}
                  {activeTab === 'exam' && <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Exam Node</h1></div>}
                  {activeTab === 'apps' && <Apps user={user} />}
                  {activeTab === 'settings' && <SettingsPage />}
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
