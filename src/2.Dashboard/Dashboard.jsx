import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../shared/Translations';
import { GET_PREMIUM_STATS } from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const Dashboard = () => {
  const { t } = useTranslation();
  const premiumStats = GET_PREMIUM_STATS(t);

  return (
    <PremiumPage>
      <div className="mb-8 pl-4 border-l-4 border-blue-600">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">환영합니다, Agent.</h1>
        <p className="text-sm font-medium text-gray-500">오늘의 시스템 상태와 주요 공지사항을 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {premiumStats.map((stat, i) => (
          <Card key={i} className="group overflow-hidden relative bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform">
              <stat.icon size={80} className="text-gray-900" />
            </div>
            <stat.icon className="w-8 h-8 mb-4 text-blue-600" />
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{stat.label}</p>
            <h2 className="text-3xl font-black text-gray-900 uppercase">{stat.value}</h2>
            <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: stat.value }}
                transition={{ delay: 0.2, duration: 1 }}
                className="h-full bg-blue-500"
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card title={t('sprint_status')} className="lg:col-span-2 h-96 border border-gray-100 shadow-sm">
          <div className="flex items-end justify-between h-64 gap-4 mt-4">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 space-y-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="bg-blue-100 hover:bg-blue-200 rounded-t-xl transition-all border-t-4 border-blue-500"
                />
                <p className="text-xs text-center font-bold text-gray-500">D-{i + 1}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('integ_logs')} className="h-96 overflow-y-auto border border-gray-100 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 animate-pulse shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-800">CI/CD PASS: CORE_ENGINE</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">2026-03-12 14:45:0{i}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PremiumPage>
  );
};
