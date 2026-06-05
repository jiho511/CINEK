import React, { useState, useEffect } from "react";
import { Film, Sparkles, TrendingUp, HelpCircle, Film as FilmIcon, Milestone, Flame, Users } from "lucide-react";
import { Movie } from "./types";
import { fallbackMovies } from "./fallbackData";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import MovieDetailModal from "./components/MovieDetailModal";
import MovieChat from "./components/MovieChat";

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-05");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<string>("fallback");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [chatTrigger, setChatTrigger] = useState<{ text: string; timestamp: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "chat">("list");

  // Fetch box office movie list
  const fetchBoxOffice = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/boxoffice?date=${date}`);
      if (!response.ok) throw new Error("네트워크 오류");
      const data = await response.json();
      setMovies(data.list || fallbackMovies);
      setDataSource(data.source || "fallback");
    } catch (err) {
      console.warn("API fetch failed, utilizing client fallback:", err);
      // fallback
      setMovies(fallbackMovies);
      setDataSource("fallback");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  // Search filter
  const filteredMovies = movies.filter((m) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      m.titleKo.toLowerCase().includes(query) ||
      m.titleEn.toLowerCase().includes(query) ||
      m.director.toLowerCase().includes(query) ||
      m.cast.some((actor) => actor.toLowerCase().includes(query)) ||
      m.genre.some((g) => g.toLowerCase().includes(query))
    );
  });

  const handleAskAiAboutMovie = (queryText: string) => {
    setChatTrigger({
      text: queryText,
      timestamp: Date.now(),
    });
    // On mobile, automatically switch active tab to "chat" tab
    setActiveTab("chat");
  };

  // Compute stats for the current list to enrich the dashboard visual flow
  const totalDailyAudience = movies.reduce((sum, m) => sum + m.dailyAudience, 0);
  const topMovie = movies.find((m) => m.rank === 1);
  const averageRating = movies.length > 0 ? movies.reduce((sum, m) => sum + m.rating, 0) / movies.length : 0;

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans">
      {/* HEADER COMPONENT */}
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        onRefresh={() => fetchBoxOffice(selectedDate)}
        dataSource={dataSource}
      />

      {/* DASHBOARD ADAPTIVE BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:px-8 space-y-6">
        
        {/* STATS OVERVIEW CARDS (HIDDEN WHEN SEARCH ACTIVE) */}
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
            {/* STAT 1: TOTAL AUDIENCE */}
            <div className="bg-[#0e0e12]/80 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 font-extrabold uppercase tracking-[0.1em] block">일일 총 관람객</span>
                <p className="text-xl font-black font-display text-white">
                  {totalDailyAudience > 0 ? `${totalDailyAudience.toLocaleString("ko-KR")}명` : "집계 중"}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">실시간 순위 10개작 합산</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Users className="w-5 h-5 text-white/60" />
              </div>
            </div>

            {/* STAT 2: TRENDING FIRST RANK MOVIE */}
            <div className="bg-[#0e0e12]/80 border border-white/10 p-5 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 font-extrabold uppercase tracking-[0.1em] block">오늘의 박스오피스 1위</span>
                <p className="text-xl font-black font-display text-red-500 truncate max-w-[180px]">
                  {topMovie ? topMovie.titleKo : "설계자"}
                </p>
                <span className="text-[10px] text-white/40 font-sans">
                  {topMovie ? `점유율 약 ${Math.round((topMovie.dailyAudience / (totalDailyAudience || 1)) * 100)}%` : "대풍행 중"}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Flame className="w-5 h-5 text-red-500" />
              </div>
            </div>

            {/* STAT 3: AVG THEATER SCORE */}
            <div className="bg-[#0e0e12]/80 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 font-extrabold uppercase tracking-[0.1em] block">미디어종합 평균 평점</span>
                <p className="text-xl font-black font-display text-white">
                  ★ {averageRating > 0 ? `${averageRating.toFixed(1)}점` : "8.4점"}
                </p>
                <span className="text-[10px] text-red-400 font-medium">상영작 종합 매우 우수</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Sparkles className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </div>
        )}

        {/* MOBILE LAYOUT TABS (ONLY VISIBLE ON MOBILE SCREEN) */}
        <div className="flex md:hidden bg-white/5 p-1 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "list"
                ? "bg-red-600 text-white shadow"
                : "text-white/40 hover:text-white"
            }`}
          >
            📋 박스오피스 ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-red-600 text-white shadow"
                : "text-white/40 hover:text-white"
            }`}
          >
            💬 AI 무비톡 분석기
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>
        </div>

        {/* DESKTOP/MOBILE SWITCHABLE GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MOVIES SECTION */}
          <div
            className={`lg:col-span-8 space-y-6 ${
              activeTab === "list" ? "block" : "hidden md:block"
            }`}
          >
            {/* Catalog Info Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
                  Daily Rankings
                  <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2.5 py-0.5 rounded-md font-sans">
                     검색 결과 {filteredMovies.length}개
                  </span>
                </h2>
                <p className="text-xs text-white/40 font-sans">카드를 클릭하시면 상세 예고편과 출연진 프로필을 감상하실 수 있습니다.</p>
              </div>
            </div>

            {/* MOVIE GRID COMPONENT */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-red-650 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-white/45 select-none tracking-widest uppercase">Analyzing Live Boxoffice Data...</p>
              </div>
            ) : (
              <MovieGrid movies={filteredMovies} onSelectMovie={setSelectedMovie} />
            )}
          </div>

          {/* RIGHT: CHATBOT ASSISTANT SECTION */}
          <div
            className={`lg:col-span-4 ${
              activeTab === "chat" ? "block" : "hidden md:block"
            }`}
          >
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="hidden lg:block">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
                  Movie Mate
                </h2>
                <p className="text-xs text-white/40 font-sans">실시간 영화 데이터와 상영 정보를 심도 있게 리뷰합니다.</p>
              </div>

              {/* CHATBOT COMPONENT */}
              <MovieChat
                onSuggestMovie={(title) => handleAskAiAboutMovie(`${title}에 대해 자세히 말해줘`)}
                triggerPrompt={chatTrigger}
              />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-5 mt-16 bg-[#0a0a0c] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium">
            © 2026 CINEK • KOFIC Korean Film Council Official API Feed • Updates every 12 hours
          </p>
          <p className="text-[9px] text-[#74747c] mt-1 font-sans">
            Google Gemini 모델에 기반하여 실시간 검색 그라운딩 기술로 수집된 박스오피스 대시보드입니다.
          </p>
        </div>
        <div className="flex space-x-6 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">Streaming Metadata Online</div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="hover:text-white cursor-pointer hover:underline transition-all">이용약관</span>
            <span className="hover:text-white cursor-pointer hover:underline transition-all">개인정보처리방침</span>
          </div>
        </div>
      </footer>

      {/* OVERLAY POPUP MODAL */}
      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onAskAi={handleAskAiAboutMovie}
      />
    </div>
  );
}
