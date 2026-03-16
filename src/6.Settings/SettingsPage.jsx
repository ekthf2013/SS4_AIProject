import React from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const SettingsPage = ({ user, theme, toggleTheme }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <PremiumPage theme={theme}>
      <SectionHeader title={t('sys_config')} subtitle={t('config_sub')} theme={theme} />
      <div className="max-w-2xl mx-auto">
        <Card title={t('prof_synth')} theme={theme}>
          <div className="flex items-center gap-8 mb-8">
            <div className={cn(
              "w-24 h-24 rounded-2xl border-2 flex items-center justify-center p-1 transition-colors duration-500",
              isDark ? "bg-slate-800 border-slate-700 font-bold" : "bg-blue-50 border-blue-100"
            )}>
              <div className={cn(
                "w-full h-full rounded-xl flex items-center justify-center shadow-sm border transition-colors duration-500",
                isDark ? "bg-slate-900 text-blue-400 border-slate-700" : "bg-white text-blue-600 border-blue-50"
              )}>
                <User size={40} />
              </div>
            </div>
            <div>
              <h4 className={cn(
                "text-2xl font-black transition-colors duration-500",
                isDark ? "text-slate-100" : "text-gray-900"
              )}>{user?.name || '사용자'}</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{user?.team} | {user?.position}</p>
              <button className="mt-4 text-[10px] font-bold text-blue-600 hover:text-blue-700 underline border-none outline-none transition-colors">{t('edit_sig')}</button>
            </div>
          </div>
          <div className="space-y-4">
            <div 
              onClick={toggleTheme}
              className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 cursor-pointer",
              isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
            )}>
              <span className={cn(
                "text-xs font-bold uppercase",
                isDark ? "text-slate-300" : "text-gray-700"
              )}>{t('dark_mode')}</span>
              <div className={cn(
                "w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300",
                isDark ? "bg-blue-600" : "bg-gray-300"
              )}>
                <motion.div 
                  animate={{ x: isDark ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </div>
            </div>
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
              isDark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100"
            )}>
              <span className={cn(
                "text-xs font-bold uppercase",
                isDark ? "text-blue-400" : "text-blue-800"
              )}>{t('realtime_tele')}</span>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PremiumPage>
  );
};
