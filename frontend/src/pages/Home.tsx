import { useState } from "react";
import Search from "../components/Search";
import Results from "../components/Results";
import LyricsLines from "../components/LyricsLines";
import Controls from "../components/Controls";
import type { VideoResult, LyricsResult, LyricLine } from "../types";

export default function Home() {
    const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
    const [lyricsResults, setLyricsResults] = useState<LyricsResult[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
    const [selectedLyrics, setSelectedLyrics] = useState<LyricsResult | null>(null);
    const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
    const [timeRange, setTimeRange] = useState({ start: "", end: "" });
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearchResults = (videos: VideoResult[], lyrics: LyricsResult[]) => {
        setVideoResults(videos);
        setLyricsResults(lyrics);
        // Reset selections
        setSelectedVideo(null);
        setSelectedLyrics(null);
        setLyricsLines([]);
    };

    const handleManualLyrics = (content: string) => {
        const lines = parseLrc(content);
        setLyricsLines(lines);
        setSelectedLyrics({ name: "Manual Input", artist: "Unknown", id: "MANUAL", syncedLyrics: content });
    };

    const parseLrc = (lrcString: string) => {
        const lines = lrcString.split('\n');
        const regex = /\[(\d+):(\d+\.?\d*)\](.*)/;
        const parsed: LyricLine[] = [];
        lines.forEach(line => {
            const match = line.match(regex);
            if (match) {
                const minutes = parseFloat(match[1]);
                const seconds = parseFloat(match[2]);
                const text = match[3].trim();
                parsed.push({
                    time: minutes * 60 + seconds,
                    text: text
                });
            }
        });
        return parsed;
    };

    return (
        <div className="flex flex-col gap-6 pb-20">
            <Search onSearchResults={handleSearchResults} />

            {(videoResults.length > 0 || lyricsResults.length > 0) && (
                <Results
                    videos={videoResults}
                    lyricsList={lyricsResults}
                    selectedVideo={selectedVideo}
                    setSelectedVideo={setSelectedVideo}
                    selectedLyrics={selectedLyrics}
                    setSelectedLyrics={(l) => {
                        setSelectedLyrics(l);
                        setLyricsLines(parseLrc(l.syncedLyrics));
                    }}
                    onManualLyrics={handleManualLyrics}
                />
            )}

            {lyricsLines.length > 0 && (
                <LyricsLines
                    lines={lyricsLines}
                    onTimeUpdate={setTimeRange}
                />
            )}

            <Controls
                selectedVideo={selectedVideo}
                selectedLyrics={selectedLyrics}
                timeRange={timeRange}
                onGenerate={(data) => setGeneratedVideo(data)}
                setLoading={setLoading}
                loading={loading}
            />

            {generatedVideo && (
                <div className="mt-8 border-2 border-black p-2 bg-black">
                    <video src={generatedVideo} controls autoPlay className="w-full" />
                    <a href={generatedVideo} download className="block text-center text-white font-mono mt-2 underline">Download Video</a>
                </div>
            )}

        </div>
    );
}
