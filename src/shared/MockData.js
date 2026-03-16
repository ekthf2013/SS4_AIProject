import { ShieldCheck, Activity, Zap, Cpu } from 'lucide-react';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

// New User Database
export const USER_ACCOUNTS = [
  // 관리자 계정 (Managers)
  { id: 'ksjung', pw: '1234', name: '정고성', team: 'SDV솔루션1팀', position: '수석', role: USER_ROLES.MANAGER },
  { id: 'sbhong', pw: '1234', name: '홍수범', team: 'SDV솔루션2팀', position: '수석', role: USER_ROLES.MANAGER },
  { id: 'yskim', pw: '1234', name: '김양수', team: 'SDV솔루션3팀', position: '책임', role: USER_ROLES.MANAGER },
  { id: 'hjsong', pw: '1234', name: '송현지', team: 'SDV솔루션4팀', position: '선임', role: USER_ROLES.MANAGER },

  // 사용자 계정 (Members)
  // SDV솔루션1팀
  { id: 'ydkwon', pw: '1234', name: '권영동', team: 'SDV솔루션1팀', position: '책임', role: USER_ROLES.USER },
  { id: 'jkkim', pw: '1234', name: '김재강', team: 'SDV솔루션1팀', position: '선임', role: USER_ROLES.USER },
  { id: 'hylee1', pw: '1234', name: '이혜윤', team: 'SDV솔루션1팀', position: '전임', role: USER_ROLES.USER },

  // SDV솔루션2팀
  { id: 'jjsi', pw: '1234', name: '시종진', team: 'SDV솔루션2팀', position: '수석', role: USER_ROLES.USER },
  { id: 'sjkim', pw: '1234', name: '김서진', team: 'SDV솔루션2팀', position: '책임', role: USER_ROLES.USER },
  { id: 'mhpark', pw: '1234', name: '박민하', team: 'SDV솔루션2팀', position: '전임', role: USER_ROLES.USER },

  // SDV솔루션3팀
  { id: 'ygkwon', pw: '1234', name: '권용균', team: 'SDV솔루션3팀', position: '선임', role: USER_ROLES.USER },
  { id: 'hjyoo1', pw: '1234', name: '유효정', team: 'SDV솔루션3팀', position: '전임', role: USER_ROLES.USER },
  { id: 'belim', pw: '1234', name: '임병은', team: 'SDV솔루션3팀', position: '전임', role: USER_ROLES.USER },

  // SDV솔루션4팀
  { id: 'shchoi', pw: '1234', name: '최서희', team: 'SDV솔루션4팀', position: '선임', role: USER_ROLES.USER },
  { id: 'yhkim2', pw: '1234', name: '김연희', team: 'SDV솔루션4팀', position: '전임', role: USER_ROLES.USER },
  { id: 'jhkim7', pw: '1234', name: '김지환', team: 'SDV솔루션4팀', position: '전임', role: USER_ROLES.USER },
  { id: 'jskim2', pw: '1234', name: '김지송', team: 'SDV솔루션4팀', position: '인턴', role: USER_ROLES.USER },
];

// Checklist Configuration with Categories
export const CHECKLIST_CONFIG = [
  {
    category: "필수 프로그램 설치",
    items: [
      { id: "nac", label: "NAC 설치" },
      { id: "eset", label: "ESET 백신 설치" },
      { id: "s1", label: "에스원 설치" },
      { id: "tea", label: "티트리 설치" },
    ]
  },
  {
    category: "보조 프로그램 설치 (선택)",
    items: [
      { id: "notepad", label: "notepad++" },
      { id: "bandizip", label: "반디집" },
    ]
  },
  {
    category: "메일 서명 등록",
    items: [
      { id: "mail_sig", label: "메일 서명 등록" }
    ]
  }
];

export const INITIAL_MEMBERS = USER_ACCOUNTS.map((user, idx) => {
  const progress = {};
  CHECKLIST_CONFIG.forEach(cat => {
    cat.items.forEach(item => {
      progress[item.id] = Math.random() > 0.5;
    });
  });

  // Calculate initial total
  const values = Object.values(progress);
  const total = Math.round((values.filter(v => v).length / values.length) * 100);

  return {
    id: idx + 1,
    userId: user.id,
    name: user.name,
    dept: user.team,
    role: user.position,
    type: user.role === USER_ROLES.MANAGER ? 'MANAGER' : 'DEPT',
    progress,
    total
  };
});

export const OPTIONAL_APPS = [
  { id: 'notepad', name: 'Notepad++', desc: '고급 텍스트 에디터', icon: '📝' },
  { id: 'bandizip', name: 'Bandizip', desc: '압축 및 해제 도구', icon: '📦' },
];

// 컨퍼런스 검색 토픽 (AI 에이전트가 현재 연도를 조합하여 검색을 확장함)
export const CONFERENCE_SEARCH_TOPICS = [
  "Software Defined Vehicle (SDV) Core Architectures & Trends",
  "Automotive AI, Autonomous Driving & Smart Cockpit Seminars",
  "Model-Based Design (MBD), MATLAB/Simulink Automotive Applications",
  "Automotive Testing, Validation, HIL/SIL Simulation Expos",
  "B2B AI Industry Exhibitions & Digital Transformation",
  "Generative AI, Large Language Models (LLM) for Engineering",
  "Next-gen Accelerated Computing & Robotics Summits",
  "Automotive Software Quality & Cybersecurity Frameworks"
];

export const CONFERENCE_DATA = [
  {
    id: 1,
    title: "AUTOMOTIVE WORLD 2026 TOKYO",
    desc: "자율주행, 커넥티드 카, EV 기술이 총망라되는 세계 최대 규모의 자동차 기술 전시회입니다.",
    location: "일본 도쿄 (Tokyo Big Sight)",
    date: "2026-01-21",
    type: "global",
    tags: ["Autonomous", "EV", "Software"],
    link: "https://www.automotiveworld.jp/tokyo/en-gb.html"
  },
  {
    id: 2,
    title: "AI & BIG DATA EXPO GLOBAL 2026",
    desc: "기업용 AI 도입, 책임 있는 AI 및 사이버 보안을 주제로 열리는 대규모 글로벌 엑스포입니다.",
    location: "영국 런던 (London, UK)",
    date: "2026-02-04",
    type: "global",
    tags: ["Big Data", "Enterprise AI", "Security"],
    link: "https://www.ai-expo.net/global/"
  },
  {
    id: 3,
    title: "ICAR-ES 2026 (AI-driven Robotics & Embedded SW)",
    desc: "AI 기반 로보틱스와 임베디드 소프트웨어의 최신 연구 결과를 공유하는 글로벌 컨퍼런스가 서울에서 개최됩니다.",
    location: "서울",
    date: "2026-02-13",
    type: "domestic",
    tags: ["AI", "Embedded SW", "Robotics"],
    link: "https://conferencealerts.co.in/show-event?id=295481"
  },
  {
    id: 4,
    title: "NVIDIA GTC 2026",
    desc: "엔비디아의 플래그십 AI 컨퍼런스로, 가속 컴퓨팅과 생성형 AI 시스템의 최신 기술 로드맵을 발표합니다.",
    location: "미국 산호세 (San Jose, CA)",
    date: "2026-03-16",
    type: "global",
    tags: ["NVIDIA", "GPU", "GenAI"],
    link: "https://www.nvidia.com/gtc/"
  },
  {
    id: 5,
    title: "오토모티브 테스팅 엑스포 코리아 2026",
    desc: "소프트웨어 검증 및 가상 테스팅 기술에 특화된 국내 최대 테스팅 기술 전시회입니다.",
    location: "일산 킨텍스",
    date: "2026-03-18",
    type: "domestic",
    tags: ["Testing", "Simulation", "Validation"],
    link: "https://www.testingexpo-korea.com/"
  },
  {
    id: 6,
    title: "US AUTOMOTIVE COMPUTING CONFERENCE 2026",
    desc: "고성능 컴퓨팅 및 차세대 아키텍처를 주제로 디트로이트에서 열리는 전문 기술 컨퍼런스입니다.",
    location: "미국 디트로이트",
    date: "2026-03-24",
    type: "global",
    tags: ["Computing", "Architecture", "SDV"],
    link: "https://www.automotive-computing-usa.com/"
  },
  {
    id: 7,
    title: "MATLAB EXPO 2026 KOREA",
    desc: "AI 기반 설계부터 자율주행, 가상 테스트까지 매스웍스의 최신 자동차 솔루션을 확인하는 필수 코스입니다.",
    location: "서울 코엑스 (COEX)",
    date: "2026-04-07",
    type: "domestic",
    tags: ["MATLAB", "Simulink", "MBD"],
    link: "https://www.matlabexpo.com/kr/2026.html"
  },
  {
    id: 8,
    title: "AI EXPO KOREA 2026 (국제인공지능대전)",
    desc: "생성형 AI, 온디바이스 AI를 포함한 전 산업 분야의 최신 AI 기술을 경험할 수 있는 국내 최대 AI 전문 전시회입니다.",
    location: "서울 코엑스 (COEX)",
    date: "2026-05-06",
    type: "domestic",
    tags: ["AI", "Generative AI", "B2B"],
    link: "https://www.aiexpo.co.kr/"
  },
  {
    id: 9,
    title: "EUROPEAN SDV SUMMIT 2026",
    desc: "유럽 지역의 SDV 생태계와 중앙 집중형 E/E 아키텍처 소프트웨어 적용 사례를 중점적으로 논의합니다.",
    location: "독일 슈투트가르트",
    date: "2026-05-21",
    type: "global",
    tags: ["Europe", "SDV", "AI"],
    link: "https://www.ecv-events.com/sdv-summit-2026"
  },
  {
    id: 10,
    title: "SDV USA 2026",
    desc: "차세대 아키텍처와 플랫폼 개발 전략을 공유하며 자율주행과 SDV의 융합을 다루는 핵심 써밋입니다.",
    location: "미국 샌프란시스코",
    date: "2026-06-28",
    type: "global",
    tags: ["Software-Defined", "Architecture"],
    link: "https://www.we-conect.com/events/sdv-usa/"
  },
  {
    id: 11,
    title: "AID 2026 (AI & Design International Conference)",
    desc: "AI 기반 디자인 이론과 툴, 자동화 설계 애플리케이션을 전문적으로 다루는 학술 및 기술 컨퍼런스입니다.",
    location: "서울",
    date: "2026-07-17",
    type: "domestic",
    tags: ["AI", "Design", "Automation"],
    link: "http://ic-aid.com/"
  },
  {
    id: 12,
    title: "9th AI SUMMIT SEOUL & EXPO",
    desc: "글로벌 AI 트렌드와 산업별 응용 사례를 집중 조명하는 서울의 대표적인 AI 비즈니스 컨퍼런스입니다.",
    location: "서울 코엑스 (COEX)",
    date: "2026-08-19",
    type: "domestic",
    tags: ["AI Business", "Industry AI"],
    link: "http://aisummitseoul.com/"
  },
  {
    id: 13,
    title: "SDV & AV TECHNOLOGY SUMMIT 2026",
    desc: "실리콘밸리의 기술력을 바탕으로 SDV 및 자율주행차의 상용화 전략과 AI 융합 트렌드를 논의합니다.",
    location: "미국 산타클라라",
    date: "2026-08-25",
    type: "global",
    tags: ["SDV", "AI", "Global"],
    link: "https://www.automotive-iq.com/events-sdv-av-technology-summit"
  }
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
