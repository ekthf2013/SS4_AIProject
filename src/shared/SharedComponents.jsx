import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation } from './Translations';
import { cn } from './utils';

// Global Premium Layout Wrapper - Updated for Light Theme
export const PremiumPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6 pb-12 w-full"
  >
    {children}
  </motion.div>
);

// Section Header - Updated for Light Theme
export const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-1">
      {title}
    </h1>
    <p className="text-sm font-medium text-gray-500">
      {subtitle}
    </p>
  </div>
);

// Premium Card - Updated for Light Theme
export const Card = ({ children, className, title }) => (
  <div className={cn("bg-white border border-gray-200 rounded-2xl p-6 shadow-sm", className)}>
    {title && (
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Language Toggle Component - Updated for Light Theme
export const LanguageToggle = () => {
  const { lang, setLang } = useTranslation();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
      className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-white transition-colors group"
    >
      <Globe size={16} className="text-gray-400 group-hover:text-blue-500" />
      <span className="text-[10px] font-bold uppercase text-gray-600 group-hover:text-blue-600 tracking-widest w-6 text-center">
        {lang}
      </span>
    </button>
  );
};
