import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  LockKeyhole,
  RotateCw
} from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { USER_ACCOUNTS } from '../shared/MockData';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo_dark.png';
import { cn } from '../shared/utils';

export const LoginView = ({ onLogin }) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Simulate login loading delay
    setTimeout(() => {
      const foundUser = USER_ACCOUNTS.find(acc => acc.id === userId.toLowerCase() && acc.pw === password);

      if (foundUser) {
        onLogin(foundUser);
      } else {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-white flex overflow-hidden z-[100]">
      {/* Left Column: Branding & Info */}
      <div className="hidden lg:flex w-1/2 bg-[#10264f] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Dot Pattern Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5 shadow-inner">
            <Shield size={18} className="text-blue-400" />
          </div>
          <span className="font-extrabold tracking-[0.25em] text-[10px] uppercase text-white/40">SDV System Division</span>
        </div>

        {/* Center Content Group */}
        <div className="relative z-10 flex flex-col justify-center flex-1 w-full py-8">
          {/* Main Logo Container */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full flex items-center justify-center mb-10"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={logoDark}
              alt="Suresoft Logo"
              className="w-full max-w-[280px] object-contain drop-shadow-2xl"
            />
          </motion.div>

          <div className="space-y-8 px-4">
            <h2 className="text-4xl xl:text-5xl font-black leading-[0.95] tracking-tighter flex flex-col">
              <span className="text-white">SDV-SYSTEM</span>
              <span className="text-blue-500/80 font-medium tracking-normal mt-1">DIVISION AI AGENT</span>
            </h2>
            
            <div className="relative max-w-sm pl-6 border-l-2 border-blue-500/30">
              <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em] mb-3">
                Core Access Protocol // {new Date().getFullYear()} Active
              </p>
              <p className="text-sm xl:text-base font-medium text-blue-100/70 leading-relaxed italic">
                Securing the next generation of <span className="text-white">SDV data flow</span> through advanced neural intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex gap-8 text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 pb-2">
          <div className="flex items-center gap-2.5 transition-colors hover:text-white/40 cursor-default">
            <LockKeyhole size={10} />
            Identity Verified
          </div>
          <div className="flex items-center gap-2.5 transition-colors hover:text-white/40 cursor-default">
            <CheckCircle2 size={10} />
            E2E Encrypted
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#001529] tracking-tight">SIGN IN TO TERMINAL</h1>
            <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-tight">
              Input your operation credentials to access the secure network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Agent ID</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toLowerCase())}
                    placeholder="Enter your unique ID"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4.5 pl-14 pr-4 text-gray-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-gray-300 shadow-sm shadow-blue-900/5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                  <button type="button" className="text-[10px] font-black text-blue-600 hover:underline tracking-tighter uppercase">Reset Key</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4.5 pl-14 pr-12 text-gray-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-gray-300 tracking-[0.4em] shadow-sm shadow-blue-900/5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 group cursor-pointer w-fit" onClick={() => setKeepSession(!keepSession)}>
              <div className={cn(
                "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                keepSession ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"
              )}
              >
                {keepSession && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={12} className="text-white" /></motion.div>}
              </div>
              <span className="text-xs font-black text-gray-400 group-hover:text-gray-600 transition-colors select-none tracking-tight">
                PERSISTENCE MODE ACTIVE
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group focus:ring-4 outline-none uppercase tracking-widest text-sm",
                isLoading 
                  ? "bg-blue-400 cursor-not-allowed text-white/50" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 focus:ring-blue-600/20"
              )}
            >
              {isLoading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Command Center
                  <LogOut size={18} className="group-hover:translate-x-1 transition-transform rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-gray-50 flex justify-center opacity-40">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center gap-2">
              IDENTITY VERIFIED PROTOCOL
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
