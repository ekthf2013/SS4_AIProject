import { ShieldCheck, Activity, Zap, Cpu } from 'lucide-react';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager'
};

export const INITIAL_MEMBERS = [
  { id: 1, name: 'KIM MIN-JUN', dept: 'Engine SW', role: 'Developer', progress: { install: true, security: true, education: false }, total: 65, type: 'MY' },
  { id: 2, name: 'LEE SEO-YUN', dept: 'ADAS System', role: 'Senior Developer', progress: { install: true, security: true, education: true }, total: 100, type: 'DEPT' },
  { id: 3, name: 'PARK JI-WOO', dept: 'Infotainment', role: 'Junior Developer', progress: { install: true, security: false, education: false }, total: 30, type: 'DEPT' },
  { id: 4, name: 'CHOI SUNG-HO', dept: 'Connectivity', role: 'Developer', progress: { install: true, security: true, education: false }, total: 72, type: 'DEPT' },
];

export const STANDARD_DOCS = [
  { id: 'D1', category: 'Quality', title: 'ASPICE Level 3 Guidelines', content: 'Automotive Software Process Improvement and Capability dEtermination...' },
  { id: 'D2', category: 'Security', title: 'ISO/SAE 21434 Cybersecurity', content: 'Road vehicles — Cybersecurity engineering is a standard for automotive cybersecurity...' },
  { id: 'D3', category: 'Platform', title: 'AUTOSAR Adaptive Architecture', content: 'AUTOSAR Adaptive Platform implements the AUTOSAR Runtime for Adaptive Applications...' },
];

export const GET_PREMIUM_STATS = (t) => [
  { label: t('proj_integrity'), value: '98.2%', icon: ShieldCheck, color: 'text-emerald-500' },
  { label: t('test_coverage'), value: '94.5%', icon: Activity, color: 'text-blue-500' },
  { label: t('sys_latency'), value: '12MS', icon: Zap, color: 'text-amber-500' },
  { label: t('core_util'), value: '42%', icon: Cpu, color: 'text-purple-500' },
];
