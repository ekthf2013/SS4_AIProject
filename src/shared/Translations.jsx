import React, { createContext, useContext, useState, useEffect } from 'react';

export const TRANSLATIONS = {
  ko: {
    // Auth
    auth_title: "AI 비서",
    auth_subtitle: "보안 액세스 프로토콜",
    input_id: "ID 입력",
    id_placeholder: "ADMIN 또는 MANAGER 입력",
    authenticate: "인증하기",
    invalid_id: '유효하지 않은 ID: "admin" 또는 "manager"를 사용하세요',

    // Sidebar/Nav
    dashboard: "대시보드",
    onboarding: "온보딩",
    vault: "데이터 저장소",
    apps: "애플리케이션",
    system: "시스템 설정",
    logout: "로그아웃",

    // Dashboard
    cmd_control: "대시보드",
    telemetry_avg: "시스템 텔레메트리 개요",
    proj_integrity: "프로젝트 무결성",
    test_coverage: "유닛 테스트 커버리지",
    sys_latency: "시스템 지연시간",
    core_util: "코어 사용률",
    sprint_status: "활성 스프린트 상태",
    integ_logs: "통합 로그",

    // Onboarding
    onboarding_title: "온보딩",
    onboarding_sub: "성장 및 통합 포털",
    tab_guide: "가이드",
    tab_growth: "성장",
    tab_education: "교육",
    tab_conference: "컨퍼런스",
    tab_dept: "부서 현황",
    tab_my: "나의 현황",
    dept_personnel: "부서 인원 상태",
    personal_task: "개인 과업 노드",
    perf_telemetry: "퍼포먼스 텔레메트리",
    compliance_rate: "컴플라이언스 비율",
    growth_node: "성장 노드",
    team_rank: "팀 랭킹",
    pathway_status: "성장 경로 상태",
    visualizing_nodes: "개발 노드 시각화 중...",

    // Knowledge Base
    vault_title: "지식 데이터 저장소",
    vault_sub: "엔지니어링 인텔리전스 시스템",
    gen_exam: "시험 문제 생성",
    doc_index: "문서 리스트",
    doc_type: "문서",
    sys_analysis: "[추가 데이터 추출을 위해 시스템 분석이 필요함]",
    exam_node_title: "시험",
    score: "점수",
    intel_complete: "분석 완료",
    ret_vault: "돌아가기",
    fin_analysis: "분석 완료",
    select_doc: "적어도 하나의 문서를 선택하세요",

    // Apps
    team_apps: "애플리케이션",
    apps_sub: "편의성 도구 모음",
    tab_welfare: "편의",
    tab_voting: "투표",
    gourmet_portal: "식당 추천",
    load_more: "더 많은 식당",
    wayfinding: "최적 경로 찾기",
    calc_path: "최적 경로 계산",
    curr_node: "출발지",
    target: "목적지",
    corp_codex: "기업 규정 정보",
    dining_vote: "회식 메뉴 투표",
    vote_q: "회식 메뉴를 골라주세요.",
    vote_active: "",
    vote_reg: "✓ 블록체인 모듈에 투표 등록됨",

    // Settings
    sys_config: "설정",
    config_sub: "터미널 및 프로토콜 설정",
    prof_synth: "프로필 합성",
    edit_sig: "프로필 편집",
    dark_mode: "다크 모드",
    realtime_tele: "실시간 텔레메트리",
    hw_interface: "하드웨어 인터페이스",
    gpu_acc: "GPU 가속 활성",
    neural_core: "뉴럴 코어 v4.1 동기화됨",
    access_rest: "시스템 설계자에게만 접근이 제한됨. 코어 파라미터 수정 시 동기화 오류 또는 프로젝트 무결성 저하가 발생할 수 있음.",

    // Co-Pilot
    copilot_title: "질문하기",
    copilot_sub: "AI 어시스턴트",
    init_cmd: "명령어 개시...",
    ai_greet: "안녕하십니까. 어떤 도움을 드릴까요?",
    ai_proc: "요청 처리 중... 데이터베이스에서 데이터 추출 중. 솔루션 최적화 완료.",

    // Common
    status_online: "상태: 온라인",
    probe_data: "검색...",
    terminal_id: "터미널.A-102"
  },
  en: {
    // Auth
    auth_title: "NEURAL AUTH",
    auth_subtitle: "Secure Access Protocol",
    input_id: "Input Terminal ID",
    id_placeholder: "ENTER ADMIN OR MANAGER",
    authenticate: "Authenticate",
    invalid_id: 'INVALID ID: USE "admin" OR "manager"',

    // Sidebar/Nav
    dashboard: "Dashboard",
    onboarding: "Onboarding",
    vault: "Vault",
    apps: "Apps",
    system: "System",
    logout: "Logout",

    // Dashboard
    cmd_control: "Command Control",
    telemetry_avg: "System Telemetry Overview",
    proj_integrity: "PROJECT INTEGRITY",
    test_coverage: "UNIT TEST COVERAGE",
    sys_latency: "SYSTEM LATENCY",
    core_util: "CORE UTILIZATION",
    sprint_status: "ACTIVE SPRINT STATUS",
    integ_logs: "INTEGRATION LOGS",

    // Onboarding
    onboarding_title: "Onboarding",
    onboarding_sub: "Growth & Integration Portal",
    tab_guide: "Guide",
    tab_growth: "Growth",
    tab_education: "Education",
    tab_conference: "Conference",
    tab_dept: "Dept Status",
    tab_my: "My Status",
    dept_personnel: "Dept Personnel Status",
    personal_task: "Personal Task Node",
    perf_telemetry: "Performance Telemetry",
    compliance_rate: "Compliance Rate",
    growth_node: "Growth Node",
    team_rank: "Team Rank",
    pathway_status: "Growth Pathway Status",
    visualizing_nodes: "Visualizing Development Nodes...",

    // Knowledge Base
    vault_title: "Knowledge Vault",
    vault_sub: "Engineering Intelligence System",
    gen_exam: "Generate Exam Node",
    doc_index: "Document Index",
    doc_type: "DOCUMENT",
    sys_analysis: "[SYSTEM ANALYSIS REQUIRED FOR FURTHER DATA EXTRACTION]",
    exam_node_title: "NEURAL EXAM NODE",
    score: "SCORE",
    intel_complete: "Intelligence Analysis Complete",
    ret_vault: "Return to Vault",
    fin_analysis: "Finish Analysis",
    select_doc: "SELECT AT LEAST ONE DOCUMENT",

    // Apps
    team_apps: "Team Applications",
    apps_sub: "Utilities & Interaction Hub",
    tab_welfare: "Welfare",
    tab_voting: "Voting",
    gourmet_portal: "Restaurant Recommendation",
    load_more: "Load More nodes",
    wayfinding: "Optimal Path Search",
    calc_path: "Calculate Optimal Path",
    curr_node: "Current Node",
    target: "Target",
    corp_codex: "Corporate Codex",
    dining_vote: "TEAM COLLABORATION: DINING PROTOCOL VOTE",
    vote_q: "WHICH REFUELING MODULE FOR THE TEAM LUNCHEON?",
    vote_active: "Protocol Active // Expires in 14h 22m",
    vote_reg: "✓ VOTE REGISTERED IN BLOCKCHAIN MODULE",

    // Settings
    sys_config: "System Configuration",
    config_sub: "Terminal & Protocol Settings",
    prof_synth: "Profile Synthesis",
    edit_sig: "Edit Neural Signature",
    dark_mode: "Dark Mode Protocol",
    realtime_tele: "Real-time Telemetry",
    hw_interface: "Hardware Interface",
    gpu_acc: "GPU Acceleration Active",
    neural_core: "Neural Core v4.1 Synced",
    access_rest: "Access restricted to system architects. modifying core parameters may result in synchronization desync or project integrity degradation.",

    // Co-Pilot
    copilot_title: "Neural Co-Pilot",
    copilot_sub: "Autonomous Unit v2.1",
    init_cmd: "INITIATE COMMAND...",
    ai_greet: "HELLO OPERATOR. HOW CAN I ASSIST IN YOUR DEVELOPMENT FLOW TODAY?",
    ai_proc: "PROCESSING REQUEST... DATA RETRIEVED FROM CORE DATABASE. SOLUTION OPTIMIZED.",

    // Common
    status_online: "Status: Online",
    probe_data: "PROBE SYSTEM DATA...",
    terminal_id: "Terminal.A-102"
  }
};

export const LanguageContext = createContext();

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children, initialLang = 'ko' }) => {
  const [lang, setLang] = useState(initialLang);
  const t = (key) => TRANSLATIONS[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
