import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, MessageSquare, Terminal, User, RefreshCw, Globe } from "lucide-react";
import { ChatMessage } from "../types";

interface MovieChatProps {
  onSuggestMovie: (title: string) => void;
  triggerPrompt?: { text: string; timestamp: number } | null;
}

export default function MovieChat({ onSuggestMovie, triggerPrompt }: MovieChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "안녕하세요! **영화 어시스턴트 '무비톡(MovieTalk)'**입니다. 🍿\n\n현재 박스오피스 영화 비하인드 스토리나 예고편 링크, 출연진 조합 분석, 장르별 개인 맞춤 영화 추천이 필요하시면 편하게 물어보세요! 아래 추천 질문을 눌러보셔도 좋습니다.",
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const preDefSuggestions = [
    "🏆 오늘 1위작 '설계자' 상세 정보",
    "🍿 불안이가 나오는 인사이드아웃2 줄거리",
    "🔥 이번주 평점 9점대 대작 추천해줘",
  ];

  // Auto trigger message when a triggerPrompt is passed from parent App
  useEffect(() => {
    if (triggerPrompt && triggerPrompt.text) {
      handleSendMessage(triggerPrompt.text);
    }
  }, [triggerPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error("서버 응답 오류");
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.sources && data.sources.length > 0) {
        setSources(data.sources);
      } else {
        setSources([]);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: "💡 죄송합니다. 실시간 영화 정보를 분석하는 네트워크 감도가 일시적으로 낮습니다. 기기와 공유기 상태를 전반적으로 확인하시고 다시 시도해 주세요.",
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "대화방을 청소했습니다. 새로운 질문이나 분석 요청을 기다릴게요! 😊",
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSources([]);
  };

  return (
    <div className="bg-[#0e0e12]/80 border border-white/10 rounded-2xl flex flex-col h-[580px] lg:h-[700px] shadow-2xl relative overflow-hidden">
      {/* CHAT HEADER */}
      <div className="p-4 border-b border-white/10 bg-black/45 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-red-600 p-2 rounded-xl text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              AI 무비 가이드 '무비톡'
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-white/40">Google Search 연결 보장형 영화 보좌관</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-[10px] text-white/50 hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
        >
          초기화
        </button>
      </div>

      {/* MESSAGES LAYER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isAi
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                    isAi
                      ? "bg-black/50 border border-white/5 text-white/80"
                      : "bg-red-600/15 border border-red-600/20 text-white"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-sans">
                    {m.text}
                  </p>
                </div>
                <span className="text-[9px] text-[#74747c] block text-right font-mono px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-black/50 border border-white/5 p-3 rounded-2xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-300"></span>
              <span className="text-[10px] text-white/40 font-sans ml-1">실시간 영화 데이터 그라운딩 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SEARCH GROUNDING SOURCES REFERENCE PANEL */}
      {sources.length > 0 && (
        <div className="px-4 py-2 bg-black/40 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Globe className="w-3.5 h-3.5 text-white/35 shrink-0" />
          <span className="text-[10px] text-white/40 shrink-0 mr-1">검색 출처:</span>
          {sources.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-red-400 hover:text-red-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap"
            >
              {s.title.length > 15 ? s.title.slice(0, 15) + "..." : s.title}
            </a>
          ))}
        </div>
      )}

      {/* SUGGESTIONS PILLS */}
      <div className="px-4 py-2 bg-black/35 flex flex-wrap gap-1.5 border-t border-white/5">
        {preDefSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSendMessage(s.replace(/🏆 |🍿 |🔥 /, ""))}
            disabled={isSending}
            className="text-[10px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors font-sans cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-white/10 bg-black/50 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          placeholder="무비톡에게 질문하세요..."
          className="flex-1 bg-white/5 border border-white/10 focus:border-red-600 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none transition-all font-sans"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-red-650 bg-red-600 text-white font-bold p-2.5 rounded-xl hover:bg-red-500 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
