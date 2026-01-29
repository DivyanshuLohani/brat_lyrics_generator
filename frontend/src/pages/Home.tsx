
import { useState } from "react";
import Step1Audio from "../components/steps/Step1Audio";
import Step2Lyrics from "../components/steps/Step2Lyrics";
import Step3Sync from "../components/steps/Step3Sync";
import Step4Style from "../components/steps/Step4Style";
import BratVideoPlayer from "../components/BratVideoPlayer";
import type { VideoResult, LyricsResult, LyricLine, TimeRange } from "../types";

export default function Home() {
    const [step, setStep] = useState(1);

    // State collected across steps
    const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
    const [selectedLyrics, setSelectedLyrics] = useState<LyricsResult | null>(null);
    const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>({ start: "0:00", end: "0:15" });
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

    // Temp state for passing data between steps
    const [cachedLyricsResults, setCachedLyricsResults] = useState<LyricsResult[]>([]);
    const [cachedSearchQuery, setCachedSearchQuery] = useState("");

    // Helper to parse LRC
    const parseLrc = (lrcString: string) => {
        if (!lrcString) return [];
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

    const reset = () => {
        setStep(1);
        setSelectedVideo(null);
        setSelectedLyrics(null);
        setLyricsLines([]);
        setGeneratedVideo(null);
        setCachedSearchQuery("");
    };

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Progress Indicator */}
            {step < 5 && !generatedVideo && (
                <div className="flex justify-between mb-4 border-b-2 border-dashed border-gray-300 pb-2 overflow-x-auto">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`font-mono text-xs sm:text-sm whitespace-nowrap px-2 ${step === s ? 'font-bold text-black' : 'text-gray-400'}`}>
                            {step === s ? `[STEP ${s}]` : `Step ${s}`}
                        </div>
                    ))}
                </div>
            )}

            {!generatedVideo && (
                <>
                    {step === 1 && (
                        <Step1Audio
                            onNext={(video, lyricsResults, query) => {
                                setSelectedVideo(video);
                                setCachedLyricsResults(lyricsResults);
                                setCachedSearchQuery(query);
                                setStep(2);
                            }}
                        />
                    )}

                    {step === 2 && (
                        <Step2Lyrics
                            initialLyrics={cachedLyricsResults}
                            initialQuery={cachedSearchQuery}
                            onBack={() => setStep(1)}
                            onNext={(lyrics) => {
                                setSelectedLyrics(lyrics);
                                setLyricsLines(parseLrc(lyrics.syncedLyrics));
                                setStep(3);
                            }}
                        />
                    )}

                    {step === 3 && (
                        <Step3Sync
                            lines={lyricsLines}
                            onBack={() => setStep(2)}
                            onNext={(range) => {
                                setTimeRange(range);
                                setStep(4);
                            }}
                        />
                    )}

                    {step === 4 && selectedVideo && selectedLyrics && (
                        <Step4Style
                            selectedVideo={selectedVideo}
                            selectedLyrics={selectedLyrics}
                            timeRange={timeRange}
                            onBack={() => setStep(3)}
                            onSuccess={(url) => setGeneratedVideo(url)}
                        />
                    )}
                </>
            )}

            {generatedVideo && (
                <div className="animate-in zoom-in duration-500">
                    <h2 className="text-2xl font-bold mb-4 bg-[#8ace00] inline-block px-2 border-2 border-black">
                        GENERATION COMPLETE
                    </h2>


                    <div className="flex justify-center">
                        <BratVideoPlayer src={generatedVideo} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <a
                            href={generatedVideo}
                            download
                            className="flex-1 text-center bg-black text-white p-3 font-bold hover:opacity-80 border-2 border-black order-1 sm:order-0"
                        >
                            DOWNLOAD VIDEO
                        </a>
                        <button
                            onClick={reset}
                            className="flex-1 bg-white text-black p-3 font-bold border-2 border-black hover:bg-gray-100 order-2 sm:order-0"
                        >
                            CREATE ANOTHER
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
