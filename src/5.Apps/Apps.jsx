import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, MapPin, FileText, ChevronRight, X, Trash2, Train, Bus, Footprints, Link2, RotateCw, Plus } from 'lucide-react';
import { useTranslation } from '../shared/Translations';
import { PremiumPage, SectionHeader, Card } from '../shared/SharedComponents';
import { cn } from '../shared/utils';

export const Apps = ({ user, addNotification, theme }) => {
  const { t } = useTranslation();
  const [appTab, setAppTab] = useState('welfare');
  const [voteCount, setVoteCount] = useState({ hotpot: 12, bbq: 28, pasta: 8 });
  const [hasVoted, setHasVoted] = useState(false);
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('회사');
  const [commuteMode, setCommuteMode] = useState('toWork'); // 'toWork' or 'toHome'
  const [path, setPath] = useState(null);

  const [shopSheetsApiUrl, setShopSheetsApiUrl] = useState(localStorage.getItem('restaurant_sheets_url') || 'https://script.google.com/macros/s/AKfycbwYANIDoL8rHDGNbjLyBR14xvWQQKoQ-ekJksmjMsGwc1cgHW7hcd3L_lGmIRm1bbs/exec');
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [isShopsLoading, setIsShopsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [newShopName, setNewShopName] = useState('');
  const [newShopDesc, setNewShopDesc] = useState('');
  const [newShopRating, setNewShopRating] = useState('5.0');
  const [selectedShop, setSelectedShop] = useState(null);

  const getDisplayRating = (shop) => {
    if (!shop) return '0.0';
    const baseRating = parseFloat(shop.rating) || 0;
    const reviews = Array.isArray(shop.reviews) ? shop.reviews : [];
    if (reviews.length === 0) return baseRating.toFixed(1);
    const sum = baseRating + reviews.reduce((acc, rev) => acc + (parseFloat(rev.rating) || 0), 0);
    return (sum / (reviews.length + 1)).toFixed(1);
  };

  const fetchRestaurants = async () => {
    if (!shopSheetsApiUrl) {
      setRestaurants([
        { id: 1, name: '샘플 중식당', cat: '중식', rating: 4.5, desc: '연동 URL을 입력하면 실제 데이터를 가져옵니다.', addedBy: 'System', reviews: [] }
      ]);
      return;
    }
    setIsShopsLoading(true);
    try {
      console.log("Fetching restaurants from:", shopSheetsApiUrl);
      const res = await fetch(shopSheetsApiUrl);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      console.log("Fetched data:", data);
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Shops Error:", err);
      // Fallback to empty array on error to prevent crash
      setRestaurants([]);
    } finally {
      setIsShopsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [shopSheetsApiUrl]);

  const handleAddRestaurant = async () => {
    if (!newShopName) return;
    const ratingNum = parseFloat(newShopRating);
    const payload = {
      action: 'add',
      id: Date.now().toString(),
      name: newShopName,
      cat: 'NEW',
      rating: isNaN(ratingNum) ? 0.0 : ratingNum,
      desc: newShopDesc || '신규 등록된 식당입니다.',
      addedBy: user.id
    };

    if (shopSheetsApiUrl) {
      try {
        await fetch(shopSheetsApiUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        setTimeout(fetchRestaurants, 1000);
      } catch (err) { alert("연동 실패"); }
    } else {
      setRestaurants(prev => [...prev, payload]);
    }
    setNewShopName('');
    setNewShopDesc('');
    setNewShopRating('5.0');
  };

  const handleDeleteRestaurant = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    if (shopSheetsApiUrl) {
      try {
        await fetch(shopSheetsApiUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'delete', id: id.toString() }) });
        setTimeout(fetchRestaurants, 1000);
      } catch (err) { alert("삭제 실패"); }
    } else {
      setRestaurants(prev => prev.filter(r => r.id !== id));
    }
    setSelectedShop(null);
  };

  const handleCalculatePath = async () => {
    if (!departure || !destination) return;

    setPath(['경로 분석 중...', '노트북LM 데이터 추출 중...']);

    try {
      const res = await fetch('/api/path-finding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ departure, destination })
      });
      const data = await res.json();
      if (data.success) {
        // Enforce array format for the UI cards
        const routes = Array.isArray(data.answer) ? data.answer : [];
        setPath(routes.length > 0 ? routes : ['결과를 가져올 수 없습니다.']);
      } else {
        setPath(['시스템 에러 발생: ' + data.error]);
      }
    } catch (err) {
      setPath(['네트워크 통신 에러: ' + err.message]);
    }
  };

  const handleVote = (key, label) => {
    if (hasVoted) return;
    setVoteCount(prev => ({ ...prev, [key]: prev[key] + 1 }));
    setHasVoted(true);
    addNotification(`[투표] "${label || key}" 메뉴에 투표하셨습니다.`);
  };

  const totalVotes = Object.values(voteCount).reduce((a, b) => a + b, 0);

  return (
    <PremiumPage theme={theme}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <SectionHeader title={t('team_apps')} subtitle={t('apps_sub')} />
        <div className="flex flex-col items-end gap-3">
          {(user.role === 'admin' || user.role === 'manager') && (
            <button 
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border",
                isConfigExpanded ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              <Link2 size={12} />
              맛집 DB 설정 {isConfigExpanded ? "닫기" : "열기"}
            </button>
          )}
          <div className="flex bg-white rounded-2xl p-1.5 gap-1 border border-gray-200 shadow-sm">
            {['welfare', 'voting'].map(tab => (
              <button
                key={tab}
                onClick={() => setAppTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  appTab === tab ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                {t(`tab_${tab}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isConfigExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-orange-600/5 border border-orange-100 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Link2 size={16} className="text-orange-600" />
                <span className="text-xs font-black text-gray-700">식당 구글 시트 URL</span>
              </div>
              <input 
                type="password"
                value={shopSheetsApiUrl}
                onChange={e => {
                  setShopSheetsApiUrl(e.target.value);
                  localStorage.setItem('restaurant_sheets_url', e.target.value);
                }}
                placeholder="맛집 시트 웹 앱 URL을 입력하세요..."
                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-medium outline-none focus:border-orange-500 shadow-inner"
              />
              <button 
                onClick={fetchRestaurants}
                className="px-3 py-1.5 bg-orange-600 text-white text-[10px] font-black rounded-lg hover:bg-orange-700 transition-all flex items-center gap-1"
              >
                <RotateCw size={12} className={cn(isShopsLoading && "animate-spin")} />
                동기화
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {appTab === 'welfare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Card title={t('gourmet_portal')} className="space-y-6 bg-white border border-gray-200 shadow-sm">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {isShopsLoading ? (
                  <div className="py-10 flex justify-center"><RotateCw className="animate-spin text-gray-300" /></div>
                ) : (Array.isArray(restaurants) && restaurants.length > 0) ? (
                  restaurants.map((shop) => (
                    <div key={shop.id} onClick={() => shop && setSelectedShop(shop)} className="cursor-pointer bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                        <Utensils size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{shop?.cat || '기타'}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{shop?.name || '기타'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-500">★{getDisplayRating(shop)}</p>
                      </div>
                    </div>
                  ))
                ) : !isShopsLoading && (
                  <div className="py-10 text-center text-gray-400 text-xs font-bold">등록된 식당이 없습니다.</div>
                )}
              </div>
              <div className="pt-5 border-t border-gray-100 space-y-3">
                <input value={newShopName} onChange={e => setNewShopName(e.target.value)} placeholder="새 식당 이름..." className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400" />
                <div className="flex gap-2">
                  <select value={newShopRating} onChange={e => setNewShopRating(e.target.value)} className="w-20 bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-center">
                    <option value="5.0">5.0</option>
                    <option value="4.5">4.5</option>
                    <option value="4.0">4.0</option>
                    <option value="3.5">3.5</option>
                    <option value="3.0">3.0</option>
                    <option value="2.5">2.5</option>
                    <option value="2.0">2.0</option>
                    <option value="1.5">1.5</option>
                    <option value="1.0">1.0</option>
                  </select>
                  <input value={newShopDesc} onChange={e => setNewShopDesc(e.target.value)} placeholder="간단한 설명..." className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400" />
                </div>
                <button onClick={handleAddRestaurant} disabled={!newShopName || isShopsLoading} className="w-full py-3.5 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700 rounded-xl font-bold tracking-widest text-white transition-colors shadow-sm">+ 추가하기</button>
              </div>
            </Card>

          <Card title={t('wayfinding')} theme={theme} className="relative group lg:col-span-1">
            <div className="space-y-6">
              <div className={cn(
                "flex rounded-xl p-1 gap-1 border transition-colors duration-500",
                theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-100 border-gray-200"
              )}>
                <button 
                  onClick={() => {
                    setCommuteMode('toWork');
                    setDestination('회사');
                    setDeparture('');
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center", 
                    commuteMode === 'toWork' 
                      ? (theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-sm" : "bg-white text-blue-600 shadow-sm") 
                      : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-gray-500")
                  )}
                >
                  출근
                </button>
                <button 
                  onClick={() => {
                    setCommuteMode('toHome');
                    setDeparture('회사');
                    setDestination('');
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center", 
                    commuteMode === 'toHome' 
                      ? (theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-sm" : "bg-white text-blue-600 shadow-sm") 
                      : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-gray-500")
                  )}
                >
                  퇴근
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">출발지</p>
                  <input
                    type="text"
                    value={departure}
                    disabled={commuteMode === 'toHome'}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="출발지를 입력하세요."
                    className={cn(
                      "w-full border rounded-xl p-4 text-sm font-bold outline-none ring-offset-0 focus:ring-1 transition-all placeholder-gray-400 border transition-colors duration-500",
                      commuteMode === 'toHome' 
                        ? (theme === 'dark' ? "bg-slate-900/50 border-slate-800 text-slate-600" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed") 
                        : (theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500")
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">도착지</p>
                  <input
                    type="text"
                    value={destination}
                    disabled={commuteMode === 'toWork'}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="목적지를 입력하세요."
                    className={cn(
                      "w-full border rounded-xl p-4 text-sm font-bold outline-none ring-offset-0 focus:ring-1 transition-all placeholder-gray-400 border transition-colors duration-500",
                      commuteMode === 'toWork' 
                        ? (theme === 'dark' ? "bg-slate-900/50 border-slate-800 text-slate-600" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed") 
                        : (theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500")
                    )}
                  />
                </div>
              </div>

              <button
                onClick={handleCalculatePath}
                disabled={!departure || !destination}
                className="w-full py-4 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold tracking-widest hover:bg-blue-700 transition-all shadow-sm"
              >
                {t('calc_path')}
              </button>

              {path && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MapPin size={16} />
                      <span className="text-xs font-bold tracking-widest uppercase">Commute Options Found</span>
                    </div>
                  </div>
                  
                  {Array.isArray(path) && path.length > 0 ? (
                    path.map((route, i) => {
                      if (typeof route === 'object' && route !== null) {
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                              "rounded-2xl p-6 border-2 shadow-sm space-y-5 hover:border-blue-300 transition-all group relative overflow-hidden mb-4",
                              theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-100"
                            )}
                          >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                            <h4 className={cn(
                              "text-lg font-black leading-tight",
                              theme === 'dark' ? "text-slate-100" : "text-gray-900"
                            )}>
                              {route.title || '추천 경로'}
                            </h4>
                            
                            <div className="space-y-4 pt-2">
                              {Array.isArray(route.steps) ? route.steps.map((step, si) => {
                                let Icon = MapPin;
                                if (step.includes('호선') || step.includes('지하철')) Icon = Train;
                                if (step.includes('버스') || step.includes('노선')) Icon = Bus;
                                if (step.includes('도보') || step.includes('걷기')) Icon = Footprints;

                                return (
                                  <div key={si} className="flex items-start gap-4 relative">
                                    <div className={cn(
                                      "p-2 rounded-lg shrink-0",
                                      theme === 'dark' ? "bg-slate-900" : "bg-gray-50"
                                    )}>
                                      <Icon size={14} className="text-gray-500" />
                                    </div>
                                    <p className={cn(
                                      "text-sm font-bold leading-relaxed pt-1 flex-1",
                                      theme === 'dark' ? "text-slate-300" : "text-gray-700"
                                    )}>{step}</p>
                                    {si < route.steps.length - 1 && (
                                      <div className="absolute left-[17px] top-[34px] w-[2px] h-[30px] bg-gray-100" />
                                    )}
                                  </div>
                                );
                              }) : null}
                            </div>
                          </motion.div>
                        );
                      }
                      return (
                        <div key={i} className="flex items-start gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2 last:mb-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <p className="text-sm font-bold text-gray-800 leading-relaxed">{route}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 italic text-sm text-rose-800">
                      결과를 가져올 수 없습니다. 다시 시도해 주세요.
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>


          <Card title={t('corp_codex')} theme={theme} className="space-y-3">
            {['Welfare Policy v2.4', 'Security Protocol 2026', 'Code of Conduct'].map((item, i) => (
              <button key={i} className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                theme === 'dark' ? "bg-slate-800/50 hover:bg-slate-700 border-slate-700 hover:border-slate-500" : "bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shadow-sm",
                    theme === 'dark' ? "bg-slate-900" : "bg-white"
                  )}>
                    <FileText className="text-blue-600" size={16} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold tracking-wider",
                    theme === 'dark' ? "text-slate-300" : "text-gray-700"
                  )}>
                     {item}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </Card>
        </div>
      )}

      {appTab === 'voting' && (
        <Card title={t('dining_vote')} theme={theme}>
          <div className="space-y-12 py-8">
            <div className="text-center">
              <h3 className={cn(
                "text-3xl font-black mb-3 transition-colors duration-500",
                theme === 'dark' ? "text-slate-100" : "text-gray-900"
              )}>{t('vote_q')}</h3>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">{t('vote_active')}</p>
            </div>

            <div className="space-y-8 max-w-2xl mx-auto">
              {Object.entries(voteCount).map(([key, count]) => {
                const percentage = Math.round((count / totalVotes) * 100);
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className={cn(
                        "text-lg font-bold uppercase transition-colors duration-500",
                        theme === 'dark' ? "text-slate-200" : "text-gray-900"
                      )}>{key}</span>
                      <span className="text-sm font-bold text-gray-500">{percentage}% ({count})</span>
                    </div>
                    <div className={cn(
                      "relative h-4 rounded-full overflow-hidden cursor-pointer group transition-colors",
                      theme === 'dark' ? "bg-slate-800 hover:bg-slate-700" : "bg-gray-100 hover:bg-gray-200"
                    )} onClick={() => handleVote(key, key)}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={cn(
                          "h-full rounded-full transition-all",
                          key === 'bbq' ? "bg-blue-600 shadow-sm" : "bg-gray-400 group-hover:bg-gray-500"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {hasVoted && (
              <p className="text-center text-xs font-bold text-green-600 mt-4 tracking-widest">{t('vote_reg')}</p>
            )}
          </div>
        </Card>
      )}

      <AnimatePresence>
        {selectedShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={cn(
              "rounded-3xl shadow-2xl max-w-sm w-full p-8 space-y-6 relative border transition-colors duration-500",
              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"
            )}>
              <button 
                onClick={() => setSelectedShop(null)} 
                className={cn(
                  "absolute top-5 right-5 transition-colors p-2 rounded-full",
                  theme === 'dark' ? "text-slate-500 hover:text-slate-200 bg-slate-800 hover:bg-slate-700" : "text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100"
                )}
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors",
                  theme === 'dark' ? "bg-orange-900/20 text-orange-400 border-orange-800/50" : "bg-orange-50 text-orange-500 border-orange-100"
                )}><Utensils size={32} /></div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-black mb-1",
                    theme === 'dark' ? "text-slate-100" : "text-gray-900"
                  )}>{selectedShop.name}</h3>
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                    <span className="text-blue-600">{selectedShop.cat}</span> &bull; ★{getDisplayRating(selectedShop)}
                    {selectedShop.addedBy ? ` \u2022 By ${selectedShop.addedBy}` : ''}
                  </p>
                </div>
              </div>

              <p className={cn(
                "text-sm font-medium leading-relaxed p-4 rounded-2xl border transition-colors duration-500",
                theme === 'dark' ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-gray-50 border-gray-100 text-gray-600"
              )}>{selectedShop.desc || '상세 정보가 없습니다.'}</p>

              <div className={cn(
                "space-y-5 pt-6 border-t",
                theme === 'dark' ? "border-slate-800" : "border-gray-100"
              )}>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reviews</h4>
                <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                  {Array.isArray(selectedShop?.reviews) && selectedShop.reviews.map((rv, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 mb-1.5 tracking-wider">{rv?.user || 'Unknown'} <span className="text-yellow-500">★{rv?.rating || '0.0'}</span></p>
                      <p className="text-sm text-gray-800 font-medium">{rv?.comment || '내용 없음'}</p>
                    </div>
                  ))}
                  {(!selectedShop?.reviews || selectedShop.reviews.length === 0) && <p className="text-sm text-gray-500 font-medium text-center py-4 bg-gray-50 rounded-xl">리뷰가 없습니다.</p>}
                </div>
                <div className="flex gap-2">
                  <select id="revRating" defaultValue="5.0" className={cn(
                    "w-20 rounded-xl p-3 text-sm font-bold outline-none ring-offset-0 focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-center border transition-colors duration-500",
                    theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900"
                  )}>
                    <option value="5.0">5.0</option>
                    <option value="4.5">4.5</option>
                    <option value="4.0">4.0</option>
                    <option value="3.5">3.5</option>
                    <option value="3.0">3.0</option>
                    <option value="2.5">2.5</option>
                    <option value="2.0">2.0</option>
                    <option value="1.5">1.5</option>
                    <option value="1.0">1.0</option>
                  </select>
                  <input type="text" id="revComment" placeholder="리뷰 작성..." className={cn(
                    "flex-1 rounded-xl p-3 text-sm font-bold outline-none ring-offset-0 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 transition-colors duration-500 border",
                    theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900"
                  )} />
                  <button onClick={async () => {
                    const rating = parseFloat(document.getElementById('revRating').value);
                    const comment = document.getElementById('revComment').value;
                    if (!comment) return;
                    
                    if (shopSheetsApiUrl) {
                      try {
                        await fetch(shopSheetsApiUrl, { 
                          method: 'POST', 
                          mode: 'no-cors', 
                          body: JSON.stringify({ action: 'addReview', id: selectedShop.id, user: user.id, rating, comment }) 
                        });
                        setTimeout(fetchRestaurants, 1000);
                        document.getElementById('revComment').value = '';
                      } catch (err) { alert("리뷰 등록 실패"); }
                    } else {
                      // Local Mock Logic
                      const newReview = { user: user.id, rating, comment };
                      const updatedShop = { ...selectedShop, reviews: [...(selectedShop.reviews || []), newReview] };
                      setSelectedShop(updatedShop);
                      setRestaurants(prev => prev.map(r => r.id === updatedShop.id ? updatedShop : r));
                      document.getElementById('revComment').value = '';
                    }
                  }} className="bg-blue-600 px-5 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-colors">등록</button>
                </div>
              </div>

              {selectedShop.addedBy === user.id && (
                <button onClick={() => handleDeleteRestaurant(selectedShop.id)} className="w-full mt-6 py-4 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-2"><Trash2 size={18} /> 이 식당 목록에서 삭제</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumPage>
  );
};
