import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Activity, Trophy, Zap } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { STANDARD_DOCS } from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const KnowledgeBase = () => {
  const { t } = useTranslation();
  const [kbTab, setKbTab] = useState('vault');
  const [selectedDoc, setSelectedDoc] = useState(STANDARD_DOCS[0]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setQuizError(null);
    setQuiz(null);
    setQuizResult(null);
    setUserAnswers({});

    try {
      const res = await fetch('/api/generate-exam', {
         method: 'POST',
          headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ notebookUrl: "https://notebooklm.google.com/notebook/d158823e-e7d7-4b96-97ef-173794f82ea5?authuser=1" })
      });
      const data = await res.json();
      if(data.success) {
         setQuiz(data.data);
      } else {
         setQuizError(data.error);
      }
    } catch(err) {
      setQuizError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitQuiz = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.answer) score++;
    });
    setQuizResult({ score, total: quiz.length });
  };

  return (
    <PremiumPage>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <SectionHeader title={t('vault_title')} subtitle={t('vault_sub')} />
        <div className="flex bg-white rounded-2xl p-1.5 gap-1 border border-gray-200 shadow-sm">
           {['vault', 'exam'].map(tab => (
             <button
                key={tab}
                onClick={() => setKbTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  kbTab === tab ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
             >
                {t(`tab_${tab}`)}
             </button>
           ))}
        </div>
      </div>

      {kbTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-[600px] overflow-y-auto bg-gray-50/50 border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 tracking-widest pl-2 mb-4 uppercase">{t('doc_index')}</h4>
            <div className="space-y-3">
              {STANDARD_DOCS.map(doc => (
                <div key={doc.id} className="relative group">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm",
                      selectedDoc.id === doc.id ? "bg-white border-blue-500 ring-1 ring-blue-500/20" : "bg-white border-gray-100 hover:border-gray-300"
                    )}
                  >
                    <BookOpen size={20} className={selectedDoc.id === doc.id ? "text-blue-600" : "text-gray-400 mt-0.5"} />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-1">{doc.category}</p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{doc.title}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 h-[600px] flex flex-col bg-white border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
              <div>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-3 inline-block border border-blue-100">
                  {selectedDoc.category} {t('doc_type')}
                </span>
                <h2 className="text-2xl font-black text-gray-900">{selectedDoc.title}</h2>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                 <Activity className="animate-pulse" size={24} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 font-medium text-gray-700 leading-relaxed whitespace-pre-line text-sm">
              {selectedDoc.content}
              {"\n\n"}{t('sys_analysis')}
            </div>
          </Card>
        </div>
      )}

      {kbTab === 'exam' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card title={t('exam_node_title')} className="min-h-[600px] bg-white border border-gray-200 shadow-sm">
            {!quiz && !isGenerating && !quizError && (
               <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[400px]">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                     <Trophy size={48} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">준비된 노트북 문서들을 바탕으로 시험 문제를 생성합니다.</p>
                  <button
                    onClick={generateQuiz}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold tracking-wider flex items-center gap-3 hover:bg-blue-700 shadow-sm transition-all"
                  >
                    <Zap size={20} /> 문제 생성하기
                  </button>
               </div>
            )}

            {isGenerating && (
               <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[400px]">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" />
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                 </div>
                 <p className="text-blue-600 font-black uppercase tracking-widest animate-pulse mt-4">NOTEBOOK LM 인지 모델 가동 중...</p>
                 <p className="text-gray-500 text-xs font-bold tracking-wider mt-2">데이터 추출 및 시험 문제 변환에 최대 15초가 소요됩니다.</p>
               </div>
            )}

            {quizError && (
               <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[400px]">
                  <p className="text-rose-600 font-bold tracking-widest text-sm">에러 발생: {quizError}</p>
                  <button onClick={generateQuiz} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 border border-gray-200">다시 시도</button>
               </div>
            )}

            {quizResult && quiz && (
              <div className="flex flex-col items-center justify-center h-full space-y-12 py-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Trophy size={64} className="text-yellow-500" />
                  </div>
                  <h3 className="text-5xl font-black text-gray-900">
                    {t('score')}: {Math.round((quizResult.score / quizResult.total) * 100)}%
                  </h3>
                  <p className="text-blue-600 font-bold tracking-widest mt-4">
                    {t('intel_complete')} ({quizResult.score} / {quizResult.total})
                  </p>
                </div>
                
                <div className="w-full max-w-4xl space-y-6 text-left mt-8">
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-4">상세 결과 분석</h4>
                   {quiz.map((q, idx) => {
                      const isCorrect = userAnswers[idx] === q.answer;
                      return (
                         <div key={idx} className={cn("p-6 rounded-2xl border transition-all", isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200")}>
                            <p className="font-bold text-gray-900 mb-3">Q{idx+1}. {q.question}</p>
                            <p className="text-sm text-gray-600 mb-1">내 선택: <span className={isCorrect ? "font-bold text-green-700" : "font-bold text-red-700"}>{q.options[userAnswers[idx]]}</span></p>
                            {!isCorrect && <p className="text-sm text-green-700 font-bold mt-2">정답: {q.options[q.answer]}</p>}
                         </div>
                      );
                   })}
                </div>

                <button
                  onClick={() => setQuiz(null)}
                  className="px-10 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold tracking-widest hover:bg-gray-50 shadow-sm"
                >
                  {t('ret_vault')}
                </button>
              </div>
            )}
            
            {!quizResult && quiz && !isGenerating && (
              <div className="space-y-10 py-4">
                {quiz.map((q, i) => (
                  <div key={i} className="space-y-5">
                    <p className="text-lg font-bold text-gray-900 leading-relaxed px-2">Q{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setUserAnswers(prev => ({ ...prev, [i]: optIdx }))}
                          className={cn(
                            "text-left p-5 rounded-2xl border transition-all font-semibold text-sm shadow-sm",
                            userAnswers[i] === optIdx ? "bg-blue-50 text-blue-700 border-blue-500 ring-1 ring-blue-500/20" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          )}
                        >
                          <span className="inline-block w-6 font-bold text-gray-400">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-8 flex justify-end border-t border-gray-100">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length < quiz.length}
                    className="bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white px-12 py-4 rounded-2xl font-bold tracking-widest hover:bg-blue-700 shadow-sm transition-all"
                  >
                    제출 및 자동 채점
                  </button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </PremiumPage>
  );
};
