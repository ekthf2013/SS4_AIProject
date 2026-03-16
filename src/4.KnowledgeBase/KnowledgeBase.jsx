import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Zap } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { STANDARD_DOCS } from '../shared/MockData';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const KnowledgeBase = () => {
  const { t } = useTranslation();
  const [kbTab, setKbTab] = useState('vault');
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docSummary, setDocSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const notebookId = "d158823e-e7d7-4b96-97ef-173794f82ea5";

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoadingDocs(true);
      try {
        const res = await fetch('/api/list-sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notebookId })
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDocs(data.data);
        } else {
          console.error("Failed to fetch docs or invalid format:", data);
        }
      } catch (err) {
        console.error("Error fetching docs:", err);
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!selectedDoc) return;
    const fetchSummary = async () => {
      setIsSummarizing(true);
      setDocSummary(null);
      try {
        const res = await fetch('/api/summarize-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             notebookUrl: `https://notebooklm.google.com/notebook/${notebookId}?authuser=1`,
             docTitle: selectedDoc.title
          })
        });
        const data = await res.json();
        if (data.success) {
           let finalAnswer = data.answer;
           if (finalAnswer.includes("couldn't find enough context") || finalAnswer.includes("I'm sorry")) {
              finalAnswer = `[알림] 현재 문서의 특정 내용을 요약하기에는 데이터가 부족하거나 접근이 제한적입니다.\n\n해당 문서 전체의 요약이나 핵심 정보를 더 정확하게 확인하시려면 상단의 'NotebookLM 열기' 버튼을 통해 원본을 확인해 주세요.`;
           }
           setDocSummary(finalAnswer);
        } else {
           setDocSummary('요약을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setDocSummary('요약 요청 중 오류가 발생했습니다.');
      } finally {
        setIsSummarizing(false);
      }
    };
    fetchSummary();
  }, [selectedDoc]);

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
         body: JSON.stringify({ 
            notebookUrl: `https://notebooklm.google.com/notebook/${notebookId}?authuser=1`,
            docTitle: selectedDoc?.title
         })
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
              {isLoadingDocs ? (
                 <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                    </div>
                    <p className="text-xs font-bold text-gray-500">문서 목록 불러오는 중...</p>
                 </div>
              ) : docs.length === 0 ? (
                 <p className="text-sm font-bold text-gray-400 pl-2">등록된 문서가 없습니다.</p>
              ) : (
                docs.map(doc => (
                  <div key={doc.id} className="relative group">
                    <button
                      onClick={() => setSelectedDoc(prev => prev?.id === doc.id ? null : doc)}
                      className={cn(
                        "w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm",
                        selectedDoc?.id === doc.id ? "bg-white border-blue-500 ring-1 ring-blue-500/20" : "bg-white border-gray-100 hover:border-gray-300"
                      )}
                    >
                      <BookOpen size={20} className={selectedDoc?.id === doc.id ? "text-blue-600" : "text-gray-400 mt-0.5"} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase">
                          {doc.title?.includes('.') ? doc.title.split('.').pop() : (doc.type || 'DOC')}
                        </p>
                        <p className="text-sm font-bold text-gray-900 leading-tight break-all">{doc.title ? doc.title.replace(/\.[^/.]+$/, "") : 'Untitled Document'}</p>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 h-[600px] flex flex-col bg-white border border-gray-200 shadow-sm overflow-hidden p-0">
            {selectedDoc ? (
              <div className="flex flex-col h-full w-full">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center z-10 shrink-0">
                  <div>
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest inline-block border border-blue-800">
                      {selectedDoc.title?.includes('.') ? selectedDoc.title.split('.').pop() : (selectedDoc.type || 'DOC')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`https://notebooklm.google.com/notebook/${notebookId}?authuser=1`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                       NotebookLM 열기
                    </a>
                  </div>
                </div>
                
                <div className="flex-1 w-full bg-white p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">{selectedDoc.title ? selectedDoc.title.replace(/\.[^/.]+$/, "") : 'Untitled Document'}</h2>
                    
                    <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 relative">
                       <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Zap size={16} className="text-blue-600" />
                          AI 요약본
                       </h3>
                       {isSummarizing ? (
                          <div className="flex items-center gap-3 text-blue-600 font-medium">
                             <div className="flex gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                             </div>
                             NotebookLM이 문서를 분석하고 요약 중입니다...
                          </div>
                       ) : (
                          <div className="text-gray-700 font-medium text-sm leading-relaxed whitespace-pre-line">
                             {docSummary || '요약 내용이 없습니다.'}
                          </div>
                       )}
                    </div>

                    <div className="text-gray-500 font-medium text-sm leading-relaxed space-y-4 pt-4 border-t border-gray-100">
                       <p>[ 시스템 알림: 구글 보안 정책상 외부 앱에서 원본 문서 임베딩이 불가능하여 핵심 내용만 AI로 요약 제공됩니다. ]</p>
                       <p className="text-blue-600 mt-4">자세한 원본 내용을 확인하거나 추가로 질문하시려면 상단의 'NotebookLM 열기' 버튼을 클릭하세요.</p>
                       {selectedDoc.url && (
                         <a href={selectedDoc.url} target="_blank" rel="noreferrer" className="block mt-4 text-blue-500 hover:underline">원본 링크 확인: {selectedDoc.url}</a>
                       )}
                    </div>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <BookOpen size={48} className="mb-4 opacity-50" />
                 <p className="font-bold">선택된 문서가 없습니다.</p>
               </div>
            )}
          </Card>
        </div>
      )}

      {kbTab === 'exam' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card 
            title={selectedDoc 
              ? `퀴즈) ${selectedDoc.title.replace(/\.[^/.]+$/, "")}` 
              : "퀴즈)"} 
            className="min-h-[600px] bg-white border border-gray-200 shadow-sm"
          >
            {!quiz && !isGenerating && !quizError && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[400px]">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                     <Trophy size={48} className="text-gray-400" />
                  </div>
                  <div className="text-center max-w-md">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Quiz Generation Protocol</p>
                    {selectedDoc ? (
                      <p className="text-gray-800 font-bold text-lg mb-6 leading-tight">
                        "<span className="text-blue-600">{selectedDoc.title ? selectedDoc.title.replace(/\.[^/.]+$/, "") : 'Untitled Document'}</span>" <br/>
                        <span className="text-sm font-medium text-gray-500">문서의 핵심 내용을 바탕으로 퀴즈를 생성합니다.</span>
                      </p>
                    ) : (
                      <p className="text-rose-500 font-bold text-sm mb-6">
                        퀴즈를 생성하려면 먼저 '지식 데이터' 탭에서 <br/>학습할 문서를 선택해 주세요.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={generateQuiz}
                    disabled={!selectedDoc}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-bold tracking-wider flex items-center gap-3 shadow-sm transition-all",
                      selectedDoc 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    )}
                  >
                    <Zap size={20} /> {selectedDoc ? '문서 기반 퀴즈 생성' : '문서 선택 필요'}
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
