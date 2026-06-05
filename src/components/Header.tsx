import React from "react";
import { Film, Calendar, Search, RefreshCw, Sparkles, Clock } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  dataSource: string;
}

export default function Header({
  selectedDate,
  setSelectedDate,
  searchQuery,
  setSearchQuery,
  isLoading,
  onRefresh,
  dataSource,
}: HeaderProps) {
  // We can let the user pick some dates around June 5th, 2026!
  const dates = [
    { value: "2026-06-01", label: "6월 1일" },
    { value: "2026-06-02", label: "6월 2일" },
    { value: "2026-06-03", label: "6월 3일" },
    { value: "2026-06-04", label: "6월 4일" },
    { value: "2026-06-05", label: "6월 5일" },
    { value: "2026-06-06", label: "6월 6일" },
  ];

  return (
    <header className="border-b border-white/10 bg-[#050507]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* LOGO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-900/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-red-600 flex items-center gap-1.5">
                CINE<span className="text-white">K</span>
                <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-mono font-normal tracking-widest uppercase">
                  BOX OFFICE
                </span>
              </h1>
              <p className="text-[11px] text-white/50 tracking-wider font-sans uppercase font-medium">
                South Korea Cinematic Live Feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all ${
                isLoading ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm py-2 pl-10 pr-4 bg-white/5 border border-white/10 hover:border-white/20 focus:border-red-600 rounded-full text-white outline-none placeholder-white/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* DATE SELECTOR */}
          <div className="flex items-center gap-2 bg-white/5 p-1 border border-white/10 rounded-full">
            <Calendar className="w-4 h-4 text-white/45 ml-2.5 hidden sm:block" />
            <div className="flex overflow-x-auto gap-1 no-scrollbar max-w-[280px] sm:max-w-xs">
              {dates.map((d) => {
                const isActive = selectedDate === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`whitespace-nowrap text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                      isActive
                        ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* REFRESH STATUS */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="새로고침"
              className={`p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-all disabled:opacity-50 ${
                isLoading ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* DATA SOURCE BADGE */}
            <span
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-full border font-bold flex items-center gap-1 uppercase tracking-widest ${
                dataSource === "live"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {dataSource === "live" ? "Live Data" : "Fallback"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
