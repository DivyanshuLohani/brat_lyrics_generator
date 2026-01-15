import { useState } from "react";
import type { VideoResult, LyricsResult } from "../types";

interface ResultsProps {
    videos: VideoResult[];
    lyricsList: LyricsResult[];
    selectedVideo: VideoResult | null;
    setSelectedVideo: (video: VideoResult) => void;
    selectedLyrics: LyricsResult | null;
    setSelectedLyrics: (lyrics: LyricsResult) => void;
    onManualLyrics: (content: string) => void;
}

export default function Results({
    videos,
    lyricsList,
    selectedVideo,
    setSelectedVideo,
    selectedLyrics,
    setSelectedLyrics,
    onManualLyrics
}: ResultsProps) {
    const [activeTab, setActiveTab] = useState("search");
    const [manualContent, setManualContent] = useState("");

    const handleManualSubmit = () => {
        if (!manualContent) return alert("Please paste LRC content");
        onManualLyrics(manualContent);
    };

    return (
        <div className="flex gap-4 border-t border-black pt-4 mt-4 h-125">
            {/* Video Column */}
            <div className="flex-1 flex flex-col border border-gray-300">
                <h3 className="font-bold border-b border-black p-2 bg-[#eee]">1. Select Audio</h3>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-white">
                    {videos.map((v) => (
                        <div
                            key={v.id}
                            onClick={() => setSelectedVideo(v)}
                            className={`flex gap-2 p-2 border cursor-pointer hover:bg-gray-100 ${selectedVideo?.id === v.id ? 'bg-[#8ace00] border-black font-bold' : 'border-gray-200'}`}
                        >
                            <img src={v.thumbnail} className="w-16 h-12 object-cover border border-black" />
                            <div className="text-xs">
                                <div className="truncate w-40" title={v.title}>{v.title}</div>
                                <div className="text-gray-600">{v.uploader} • {v.duration}</div>
                            </div>
                        </div>
                    ))}
                    {videos.length === 0 && <div className="text-gray-500 text-sm p-2">No videos loaded...</div>}
                </div>
            </div>

            {/* Lyrics Column */}
            <div className="flex-1 flex flex-col border border-gray-300">
                <h3 className="font-bold border-b border-black p-2 bg-[#eee]">2. Select Lyrics</h3>

                {/* Tabs */}
                <div className="flex border-b border-black text-sm">
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`flex-1 p-2 ${activeTab === 'search' ? 'bg-white font-bold' : 'bg-gray-200'}`}
                    >
                        Search
                    </button>
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={`flex-1 p-2 ${activeTab === 'manual' ? 'bg-white font-bold' : 'bg-gray-200'}`}
                    >
                        Manual Paste
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-2 bg-white">
                    {activeTab === 'search' && (
                        <div className="space-y-2">
                            {lyricsList.map((l) => (
                                <div
                                    key={l.id}
                                    onClick={() => setSelectedLyrics(l)}
                                    className={`p-2 border cursor-pointer hover:bg-gray-100 ${selectedLyrics?.id === l.id ? 'bg-[#8ace00] border-black font-bold' : 'border-gray-200'}`}
                                >
                                    <div className="text-sm">{l.name}</div>
                                    <div className="text-xs text-gray-600">{l.artist} - {l.album}</div>
                                </div>
                            ))}
                            {lyricsList.length === 0 && <div className="text-gray-500 text-sm">No lyrics found...</div>}
                        </div>
                    )}

                    {activeTab === 'manual' && (
                        <div className="h-full flex flex-col gap-2">
                            <p className="text-xs text-gray-500">Paste LRC content below:</p>
                            <textarea
                                className="flex-1 w-full border border-black p-2 font-mono text-xs resize-none focus:outline-none"
                                placeholder="[00:12.00] Line 1..."
                                value={manualContent}
                                onChange={(e) => setManualContent(e.target.value)}
                            />
                            <button onClick={handleManualSubmit} className="bg-black text-white text-xs p-2 font-bold hover:opacity-80">
                                Use Manual Lyrics
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
