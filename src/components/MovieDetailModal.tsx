import React from "react";
import { X, Play, Clock, Calendar, Star, Tag, User, MessageSquare, ExternalLink } from "lucide-react";
import { Movie } from "../types";

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onAskAi: (title: string) => void;
}

export default function MovieDetailModal({ movie, onClose, onAskAi }: MovieDetailModalProps) {
  if (!movie) return null;

  // Make YouTube embedded link secure and formatted
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    // Extract video ID from standard YouTube URL or search
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(movie.trailerUrl || "");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container Card */}
      <div
        id="detail-modal-card"
        className="relative bg-[#0e0e12]/95 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 bg-black/70 p-2.5 rounded-full text-white/50 hover:text-white cursor-pointer transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Contents */}
        <div className="overflow-y-auto flex-1 no-scrollbar space-y-6 pb-8">
          {/* TRAILER IFRAME OR HERO BANNER */}
          <div className="relative bg-black w-full aspect-video md:h-[380px] shrink-0 border-b border-white/5">
            {embedUrl ? (
              <iframe
                title={`${movie.titleKo} 공식 예고편`}
                src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full relative flex flex-col justify-end p-8 bg-gradient-to-t from-[#0e0e12] to-transparent">
                <img
                  src={movie.backdropUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200"}
                  alt={movie.titleKo}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 select-none pointer-events-none"
                />
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest bg-red-600 text-white font-extrabold px-3 py-1 rounded inline-block font-mono">
                    Official Banner
                  </span>
                  <p className="text-white/60 text-xs">본 영화는 메인 공식 예고편이 준비 중입니다.</p>
                </div>
              </div>
            )}
          </div>

          {/* DETAIL DESCRIPTION AND METRICS */}
          <div className="px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* LEFT / CENTER CORE DETAILS */}
            <div className="md:col-span-2 space-y-6">
              {/* HEADINGS */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {movie.titleKo}
                  </h2>
                  <span className="bg-white/5 text-white/60 text-xs border border-white/10 px-2.5 py-1 rounded-lg font-mono font-medium">
                    RANK {movie.rank.toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-sm text-white/40 font-sans">{movie.titleEn}</p>
              </div>

              {/* RATING, GENRES, RUNTIME PILLS */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  평점 {movie.rating.toFixed(1)} / 10
                </div>
                <div className="bg-white/5 text-white/70 border border-white/10 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-sans">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  {movie.runtime}분
                </div>
                <div className="bg-white/5 text-white/70 border border-white/10 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  개봉일 {movie.releaseDate}
                </div>
              </div>

              {/* SYNOPSIS */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#74747c] uppercase tracking-[0.15em] flex items-center gap-1.5 font-display">
                  <Tag className="w-3.5 h-3.5 text-[#74747c]" /> 줄거리 (Synopsis)
                </h4>
                <p className="text-sm text-white/80 leading-relaxed font-sans font-light select-text">
                  {movie.synopsis}
                </p>
              </div>

              {/* ACTION CALL: ASK MOVIETALK CHATBOT */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onAskAi(`${movie.titleKo}에 대해 자세히 알려줘`);
                    onClose();
                  }}
                  className="w-full sm:w-auto bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 hover:text-red-300 transition-all font-bold text-xs py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  AI '무비톡'에게 이 영화 비하인드 질문하기
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR DETAILS (CAST & DIRECTOR) */}
            <div className="bg-black/40 border border-white/15 p-5 rounded-2xl space-y-6">
              {/* DIRECTOR */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-[#74747c] uppercase tracking-[0.15em] font-display">
                  감독 (Director)
                </h4>
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-semibold text-white/60">
                    <User className="w-4 h-4 text-white/55" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-sans">{movie.director}</p>
                    <p className="text-[9px] text-[#74747c] font-sans">Main Director</p>
                  </div>
                </div>
              </div>

              {/* CAST LIST */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-[#74747c] uppercase tracking-[0.15em] font-display">
                  주요 출연진 (Cast)
                </h4>
                <div className="space-y-2">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white/70 flex items-center justify-center text-xs font-semibold">
                        {actor.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-sans">{actor}</p>
                        <p className="text-[9px] text-[#74747c] font-sans">배우 (Actor)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MORE SOURCES */}
              <div className="pt-2">
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                    movie.titleKo + " 영화 정보"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center text-[10px] text-white/45 hover:text-white font-medium border border-white/10 bg-white/5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  포털 영화 상세 검색 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
