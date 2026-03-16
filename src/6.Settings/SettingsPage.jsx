import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';

export const SettingsPage = () => {
  const { t } = useTranslation();
  return (
    <PremiumPage>
      <SectionHeader title={t('sys_config')} subtitle={t('config_sub')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title={t('prof_synth')} className="bg-white shadow-sm border-gray-200">
          <div className="flex items-center gap-8 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center p-1">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                <User size={40} />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-gray-900">Kim Min-Jun</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Core Infrastructure Developer</p>
              <button className="mt-4 text-[10px] font-bold text-blue-600 hover:text-blue-700 underline border-none outline-none transition-colors">{t('edit_sig')}</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold uppercase text-gray-700">{t('dark_mode')}</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-1" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-xs font-bold uppercase text-blue-800">{t('realtime_tele')}</span>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
              </div>
            </div>
          </div>
        </Card>
        <Card title={t('hw_interface')} className="bg-white shadow-sm border-gray-200">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('gpu_acc')}</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('neural_core')}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 leading-relaxed mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {t('access_rest')}
            </p>
          </div>
        </Card>
      </div>
    </PremiumPage>
  );
};
