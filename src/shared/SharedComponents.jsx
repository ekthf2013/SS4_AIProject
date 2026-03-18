import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation } from './Translations';
import { cn } from './utils';

// Global Premium Layout Wrapper - Updated for Theme support
export const PremiumPage = ({ children, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6 pb-12 w-full"
  >
    {children}
  </motion.div>
);

// Section Header - Updated for Theme support
export const SectionHeader = ({ title, subtitle, theme }) => {
  const isDark = theme === 'dark';
  return (
    <div className="mb-6">
      <h1 className={cn(
        "text-3xl font-bold mb-1 transition-colors duration-500",
        isDark ? "text-slate-100" : "text-gray-900"
      )}>
        {title}
      </h1>
      <p className={cn(
        "text-sm font-medium transition-colors duration-500",
        isDark ? "text-slate-400" : "text-gray-500"
      )}>
        {subtitle}
      </p>
    </div>
  );
};

// Premium Card - Updated for Theme support
export const Card = ({ children, className, title, theme }) => (
  <div className={cn(
    "border rounded-2xl p-6 shadow-sm transition-colors duration-500",
    theme === 'dark' ? "bg-[#1e293b] border-slate-700" : "bg-white border-gray-200",
    className
  )}>
    {title && (
      <div className="flex items-center gap-2 mb-5">
        <h3 className={cn(
          "text-lg font-bold tracking-tight transition-colors duration-500",
          theme === 'dark' ? "text-slate-200" : "text-gray-800"
        )}>{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Language Toggle Component - Updated for Theme support
export const LanguageToggle = ({ theme }) => {
  const { lang, setLang } = useTranslation();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
      className={cn(
        "flex items-center gap-2 p-2 rounded-xl border transition-colors group",
        theme === 'dark' ? "bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-slate-700" : "bg-gray-50 border-gray-200 hover:border-blue-500 hover:bg-white"
      )}
    >
      <Globe size={16} className={cn(
        "group-hover:text-blue-500",
        theme === 'dark' ? "text-slate-400" : "text-gray-400"
      )} />
      <span className={cn(
        "text-[10px] font-bold uppercase group-hover:text-blue-600 tracking-widest w-6 text-center",
        theme === 'dark' ? "text-slate-300" : "text-gray-600"
      )}>
        {lang}
      </span>
    </button>
  );
};
