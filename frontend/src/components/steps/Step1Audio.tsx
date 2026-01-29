
import { useState } from "react";
import axios from "axios";
import type { VideoResult, LyricsResult } from "../../types";

interface Step1Props {
    onNext: (video: VideoResult, lyricsResults: LyricsResult[], query: string) => void;
}

export default function Step1Audio({ onNext }: Step1Props) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState<VideoResult[]>([]);
    // We store lyrics results temporarily to pass them to the next step
    const [lyricsCache, setLyricsCache] = useState<LyricsResult[]>([]);

    const [hasSearched, setHasSearched] = useState(false);
    const [previewVideo, setPreviewVideo] = useState<VideoResult | null>(null);

    const isUrl = (text: string) => {
        return text.includes("youtube.com") || text.includes("youtu.be");
    };

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setHasSearched(true);
        setVideos([]);
        setLyricsCache([]);

        try {
            if (isUrl(query)) {
                // If it's a URL, only search for video
                const vidRes = await axios.get(`/search/video?q=${encodeURIComponent(query)}`);
                setVideos(vidRes.data);
                setLyricsCache([]); // No lyrics for URL search
            } else {
                // If it's text, search both
                const [vidRes, lyrRes] = await Promise.all([
                    axios.get(`/search/video?q=${encodeURIComponent(query)}`),
                    axios.get(`/search/lyrics?q=${encodeURIComponent(query)}`)
                ]);
                setVideos(vidRes.data);
                setLyricsCache(lyrRes.data);
            }
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold bg-white inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                STEP 1: SELECT AUDIO
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    className="flex-3 w-full p-3 border-2 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#8ace00]/50 selection:bg-[#8ace00]"
                    placeholder="Search Song or Paste YouTube URL..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1 bg-black text-white font-bold p-3 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(138,206,0,1)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-30"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                        "SEARCH"
                    )}
                </button>
            </div>

            {loading && (
                <div className="grid gap-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border-2 border-gray-200 p-2 flex gap-4 opacity-50">
                            <div className="w-32 h-24 bg-gray-300" />
                            <div className="flex flex-col justify-center flex-1 gap-2">
                                <div className="h-6 bg-gray-300 w-3/4" />
                                <div className="h-4 bg-gray-300 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && videos.length > 0 && (
                <div className="grid gap-4">
                    {videos.map(video => (
                        <div
                            key={video.id}
                            className="border-2 border-black p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#8ace00] transition-colors group"
                            onClick={() => onNext(video, lyricsCache, query)}
                        >
                            <div className="flex gap-4 items-center flex-1 w-full sm:w-auto">
                                <img src={video.thumbnail} alt={video.title} className="w-24 h-16 sm:w-32 sm:h-24 object-cover border border-black shrink-0" />
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-white line-clamp-2">{video.title}</h3>
                                    <p className="text-sm font-mono mt-1 group-hover:text-black truncate">{video.uploader}</p>
                                    <p className="text-xs mt-1 text-gray-500 group-hover:text-black">{video.duration}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewVideo(video);
                                }}
                                className="w-full sm:w-auto bg-white border-2 border-black p-2 font-bold text-xs hover:bg-black hover:text-white transition-colors sm:mr-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                            >
                                PREVIEW
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && hasSearched && videos.length === 0 && (
                <div className="text-center italic text-gray-500 mt-4">
                    No videos found because... brat
                </div>
            )}

            {/* Preview Modal */}
            {previewVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#8ace00] p-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full">
                        <div className="flex justify-between items-center mb-2 bg-white border-2 border-black p-2">
                            <h3 className="font-bold truncate">{previewVideo.title}</h3>
                            <button
                                onClick={() => setPreviewVideo(null)}
                                className="font-bold hover:text-red-600 px-2"
                            >
                                [CLOSE]
                            </button>
                        </div>
                        <div className="aspect-video bg-black border-2 border-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${previewVideo.id}?autoplay=1`}
                                title="YouTube video player"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="mt-2 flex justify-end">
                            <button
                                onClick={() => {
                                    setPreviewVideo(null);
                                    onNext(previewVideo, lyricsCache, query);
                                }}
                                className="bg-black text-white font-bold p-3 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors"
                            >
                                SELECT THIS VIDEO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
