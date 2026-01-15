export interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: number | string;
  uploader: string;
}

export interface LyricsResult {
  id: number | string;
  name: string;
  artist: string;
  album?: string;
  syncedLyrics: string;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface HistoryItem {
  id: number;
  song: string;
  artist: string;
  filename: string;
  created_at: string;
}

export interface JobStatus {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  position: number;
  result?: string;
  error?: string;
}
