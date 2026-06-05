export interface Movie {
  rank: number;
  titleKo: string;
  titleEn: string;
  releaseDate: string;
  dailyAudience: number;
  totalAudience: number;
  rankChange: number; // Positive is up, negative is down, 0 is same
  genre: string[];
  rating: number;
  runtime: number; // in minutes
  synopsis: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  posterUrl?: string; // We can use placeholder or generate matching icons
  backdropUrl?: string;
}

export interface BoxOfficeResponse {
  date: string;
  list: Movie[];
  source: "live" | "fallback" | "cached";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
