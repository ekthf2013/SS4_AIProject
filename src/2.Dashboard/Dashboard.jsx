import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Utensils, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { 
  CONFERENCE_DATA, 
  INITIAL_MEMBERS, 
  USER_ROLES 
} from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const Dashboard = ({ user, theme, members }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  // Statistics Calculation
  const stats = useMemo(() => {
    const isManager = user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;
    const allMembers = members || INITIAL_MEMBERS;
    
    // For Managers: Team Statistics
    const teamMembers = allMembers.filter(m => m.dept === user?.team && m.userId !== user?.id);
    const teamAvg = teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((acc, m) => acc + (m.total || 0), 0) / teamMembers.length) 
      : 0;

    // For All: Current User's Statistics
    const myData = allMembers.find(m => m.userId === user?.id) || { total: 0, progress: {} };

    return {
      teamCount: teamMembers.length,
      teamAvg,
      myProgress: myData.total,
      myData,
      upcomingConferences: CONFERENCE_DATA
        .filter(conf => new Date(conf.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3),
      activeProjects: 4,
      isManager
    };
  }, [user, members]);

  const QUICK_STATS = [
    { 
      label: stats.isManager ? '부서 온보딩' : '나의 온보딩', 
      value: `${stats.isManager ? stats.teamAvg : stats.myProgress}%`, 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { label: '시스템 안정성', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: '활성 프로젝트', value: stats.activeProjects, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: '응답 속도', value: '12ms', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <PremiumPage theme={theme}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "text-3xl font-black tracking-tight transition-colors duration-500",
                isDark ? "text-slate-100" : "text-gray-900"
              )}
            >
              {t('welcome_back') || '반가워요'}, <span className="text-blue-600">{user?.name}</span>님
            </motion.h1>
            <p className={cn(
              "text-sm font-bold transition-colors duration-500",
              isDark ? "text-slate-400" : "text-gray-500"
            )}>
              {stats.isManager ? '부서의 온보딩 현황과 지표를 관리하세요.' : '당신의 온보딩 여정과 주요 지표를 확인하세요.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-4 py-2 rounded-2xl border flex items-center gap-2 transition-colors",
              isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-100 text-gray-600"
            )}>
              <Calendar size={16} className="text-blue-600" />
              <span className="text-xs font-black">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card theme={theme} className="group hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-xl", s.bg)}>
                    <s.icon size={20} className={s.color} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                <h3 className={cn(
                  "text-2xl font-black transition-colors",
                  isDark ? "text-slate-100" : "text-gray-900"
                )}>{s.value}</h3>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart/Feature Area */}
          <div className="lg:col-span-2 space-y-6">
            {stats.isManager ? (
              <Card title="부서 온보딩 진척도" theme={theme}>
                <div className="h-64 flex items-end justify-between gap-4 mt-8 px-2">
                  {(members || INITIAL_MEMBERS).filter(m => m.dept === user?.team && m.userId !== user?.id).slice(0, 8).map((m, i) => (
                    <div key={i} className="flex-1 h-full group relative flex flex-col justify-end items-center">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        {m.name}: {m.total}%
                      </div>
                      <div className="w-full relative flex-1 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${m.total || 0}%` }}
                          className={cn(
                            "w-full rounded-t-xl transition-all duration-500 relative overflow-hidden",
                            isDark ? "bg-blue-600/40" : "bg-blue-600/10"
                          )}
                        >
                          <div className="absolute bottom-0 left-0 w-full bg-blue-600 h-full opacity-40" />
                          <div className="absolute bottom-0 left-0 w-full bg-blue-600 h-[3px]" />
                        </motion.div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-4 truncate w-full text-center shrink-0">{m.name}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card title="나의 온보딩 현황" theme={theme}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="relative w-48 h-48 drop-shadow-2xl">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="96" cy="96" r="84" className={isDark ? "stroke-slate-800 fill-none" : "stroke-gray-100 fill-none"} strokeWidth="16" />
                        <motion.circle
                          cx="96" cy="96" r="84"
                          stroke="currentColor" strokeWidth="16" strokeDasharray="528"
                          initial={{ strokeDashoffset: 528 }}
                          animate={{ strokeDashoffset: 528 - (528 * (stats.myProgress || 0) / 100) }}
                          className="text-blue-600 fill-none"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn(
                          "text-4xl font-black",
                          isDark ? "text-slate-100" : "text-gray-900"
                        )}>{stats.myProgress}%</span>
                        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">온보딩 완료율</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>현재 성취 지표</span>
                        <span className="text-blue-500">EXCELLENT</span>
                      </div>
                      <h4 className={cn("text-lg font-black", isDark ? "text-slate-100" : "text-gray-900")}>프로토콜 준수 시스템</h4>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                        팀 합류 후 기본적인 시스템 설정 및 교육 이수가 원활하게 진행되고 있습니다.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn("p-4 rounded-2xl border transition-all", isDark ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-100")}>
                        <p className="text-[10px] font-black text-gray-400 mb-1 uppercase">팀 내 랭킹</p>
                        <p className={cn("text-xl font-black", isDark ? "text-slate-100" : "text-gray-900")}>#04 / 12</p>
                      </div>
                      <div className={cn("p-4 rounded-2xl border transition-all", isDark ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-100")}>
                        <p className="text-[10px] font-black text-gray-400 mb-1 uppercase">성장 노드</p>
                        <p className={cn("text-xl font-black text-emerald-500")}>+3.2%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Knowledge Access */}
              <Card title="필수 문서 가이드" theme={theme}>
                <div className="space-y-3">
                  {['ASPICE 지침 v3.0', '보안 프로토콜 2026', 'SDV 아키텍처 가이드'].map((doc, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 rounded-xl border group cursor-pointer transition-all",
                      isDark ? "bg-slate-800/50 border-slate-700 hover:border-blue-500/50" : "bg-gray-50 border-gray-100 hover:border-blue-200"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          isDark ? "text-slate-300" : "text-gray-700"
                        )}>{doc}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent App Activity - Gourmet */}
              <Card title="금주의 인기 맛집" theme={theme}>
                <div className="space-y-4">
                  {[
                    { name: '스토리 오브 남산', cat: '양식', rating: 4.8 },
                    { name: '진진가라', cat: '한식', rating: 4.5 }
                  ].map((shop, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-500"
                      )}>
                        <Utensils size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-bold truncate",
                          isDark ? "text-slate-200" : "text-gray-900"
                        )}>{shop.name}</p>
                        <p className="text-[10px] font-bold text-gray-500">{shop.cat}</p>
                      </div>
                      <span className="text-xs font-black text-amber-500">★{shop.rating}</span>
                    </div>
                  ))}
                  <button className="w-full py-2.5 mt-2 bg-blue-600/10 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-600/20 transition-colors uppercase tracking-widest">
                    맛집 포털 바로가기
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Upcoming Conferences */}
            <Card title="다가오는 컨퍼런스" theme={theme} className="h-full">
              <div className="space-y-6 mt-4">
                {stats.upcomingConferences.map((conf, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-dashed border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-600" />
                    <p className="text-[10px] font-black text-blue-600 mb-1">{conf.date}</p>
                    <h4 className={cn(
                      "text-sm font-bold leading-tight mb-2 uppercase",
                      isDark ? "text-slate-100" : "text-gray-900"
                    )}>{conf.title}</h4>
                    <div className="flex flex-wrap gap-1">
                      {conf.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Neural Co-Pilot Quick Prompt */}
            <div className={cn(
              "p-6 rounded-3xl border shadow-xl relative overflow-hidden group transition-all duration-500",
              isDark ? "bg-slate-900 border-slate-700" : "bg-blue-600 border-blue-500 text-white"
            )}>
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <MessageSquare size={120} />
              </div>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-2 opacity-80",
                isDark ? "text-blue-400" : "text-blue-100"
              )}>NEURAL CO-PILOT</p>
              <h3 className="text-xl font-black mb-4 leading-tight">AI 에이전트와<br />성장을 시작하세요</h3>
              <button className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95",
                isDark ? "bg-blue-600 text-white shadow-blue-900/40" : "bg-white text-blue-600 shadow-blue-700/40"
              )}>
                도움받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </PremiumPage>
  );
};
