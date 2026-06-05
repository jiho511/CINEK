import React from "react";
import { Star, Clapperboard, Calendar, Users, TrendingUp, ArrowUp, ArrowDown, Minus, Play } from "lucide-react";
import { Movie } from "../types";

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function MovieGrid({ movies, onSelectMovie }: MovieGridProps) {
  // Utility to format values like 11342091 into '1,134.2만' or standard commas
  const formatAudience = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만 명`;
    }
    return `${num.toLocaleString("ko-KR")} 명`;
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-red-600 text-white shadow-lg shadow-red-600/20 font-black italic";
      case 2:
        return "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5 font-bold italic";
      case 3:
        return "bg-white/5 text-white/80 border border-white/10 shadow-lg shadow-white/5 font-bold italic";
      default:
        return "bg-white/5 text-white/50 border border-white/5 font-medium italic";
    }
  };

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
        <Clapperboard className="w-12 h-12 text-white/20 mb-4 animate-pulse" />
        <p className="text-sm text-white/60">검색 조건에 맞는 최신 영화가 존재하지 않습니다.</p>
        <p className="text-xs text-white/40 mt-1">다른 제목이나 배우명을 작성해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {movies.map((movie) => {
        return (
          <div
            key={movie.rank}
            id={`movie-card-${movie.rank}`}
            onClick={() => onSelectMovie(movie)}
            className="group relative bg-[#0e0e12]/80 border border-white/10 hover:border-red-600/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-950/10 transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* BACKDROP IMAGE HEADER */}
            <div className="relative h-44 overflow-hidden bg-black shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] to-transparent z-10" />
              <img
                src={movie.backdropUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400"}
                alt={movie.titleKo}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
              />

              {/* FLOATING RANK HIGHLIGHT */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-lg ${getRankBadgeStyle(
                    movie.rank
                  )}`}
                >
                  {movie.rank.toString().padStart(2, "0")}
                </span>

                {/* RANK CHANGE TREND */}
                <span className="bg-black/80 backdrop-blur border border-white/10 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono font-bold">
                  {movie.rankChange > 0 && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 block" /> {movie.rankChange}
                    </span>
                  )}
                  {movie.rankChange < 0 && (
                    <span className="text-red-500 flex items-center gap-0.5">
                      <ArrowDown className="w-3 h-3 block" /> {Math.abs(movie.rankChange)}
                    </span>
                  )}
                  {movie.rankChange === 0 && (
                    <span className="text-white/40 flex items-center gap-0.5">
                      <Minus className="w-3 h-3" />
                    </span>
                  )}
                </span>
              </div>

              {/* RATING STICKER */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-black/80 backdrop-blur border border-white/10 rounded-xl py-1 px-2.5 flex items-center gap-1 text-[11px] font-bold text-red-500 font-sans">
                  <Star className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* QUICK PLAY ACTION HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <div className="bg-red-600 text-white p-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
                  <Play className="w-5 h-5 fill-white" />
                </div>
              </div>
            </div>

            {/* DETAILS CONTAINER */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                {/* GENRE LABELS */}
                <div className="flex flex-wrap gap-1.5">
                  {movie.genre.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="text-[10px] bg-white/5 text-white/50 hover:text-white px-2.5 py-1 rounded-md transition-all font-medium border border-white/10"
                    >
                      {g}
                    </span>
                  ))}
                  <span className="text-[10px] text-white/40 font-sans px-1 py-1 ml-auto">
                    {movie.runtime}분
                  </span>
                </div>

                {/* TITLES */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-500 transition-colors tracking-tight line-clamp-1">
                    {movie.titleKo}
                  </h3>
                  <p className="text-xs text-white/40 font-sans tracking-wide line-clamp-1">
                    {movie.titleEn}
                  </p>
                </div>

                {/* SHORT SYNOPSIS */}
                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed pt-1 select-none font-light">
                  {movie.synopsis}
                </p>
              </div>

              {/* BOX OFFICE METRICS FOOTER */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-white/40 block">일일 관객</span>
                  <span className="font-semibold text-white/80 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-white/30" />
                    {movie.dailyAudience.toLocaleString("ko-KR")}명
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block">누적 관객</span>
                  <span className="font-semibold text-white/80 mt-0.5 block">
                    {formatAudience(movie.totalAudience)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
