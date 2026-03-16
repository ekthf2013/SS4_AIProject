import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { SectionHeader } from '../shared/SharedComponents';
import { USER_ACCOUNTS } from '../shared/MockData';

export const LoginView = ({ onLogin }) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundUser = USER_ACCOUNTS.find(acc => acc.id === userId.toLowerCase() && acc.pw === password);
    
    if (foundUser) {
      onLogin(foundUser);
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-12 space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-2">
             <h1 className="text-2xl font-black text-gray-900">{t('auth_title')}</h1>
             <p className="text-sm font-bold text-gray-500">{t('auth_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('input_id')}</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toLowerCase())}
                placeholder={t('id_placeholder')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold tracking-wider placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요 (기본값: 1234)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold tracking-wider placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold tracking-widest hover:bg-blue-700 shadow-sm transition-all"
          >
            {t('authenticate')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
