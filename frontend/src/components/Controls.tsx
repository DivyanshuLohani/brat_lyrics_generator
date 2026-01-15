import { useState, useEffect } from "react";
import axios from "axios";
import type { VideoResult, LyricsResult, TimeRange } from "../types";

interface ControlsProps {
    selectedVideo: VideoResult | null;
    selectedLyrics: LyricsResult | null;
    timeRange: TimeRange;
    onGenerate: (url: string) => void;
    setLoading: (loading: boolean) => void;
    loading: boolean;
}

export default function Controls({ selectedVideo, selectedLyrics, timeRange, onGenerate, setLoading, loading }: ControlsProps) {
    const [params, setParams] = useState({
        start_time: "",
        end_time: "",
        lofi: 5,
        fontsize: 400,
        bgcolor: "#FFFFFF"
    });

    useEffect(() => {
        if (timeRange.start) {
            setParams(p => ({ ...p, start_time: timeRange.start, end_time: timeRange.end }));
        }
    }, [timeRange]);

    const [statusMessage, setStatusMessage] = useState<string>("");

    const handleGenerate = async () => {
        if (!selectedVideo || (!selectedLyrics && selectedLyrics !== 'MANUAL')) {
            alert("Please select Audio and Lyrics");
            return;
        }
        setLoading(true);
        setStatusMessage("Submitting request...");

        try {
            const payload = {
                song: selectedLyrics.name || "Unknown",
                artist: selectedLyrics.artist || "Unknown",
                video_id: selectedVideo.id,
                lyrics_id: selectedLyrics.id === 'MANUAL' ? null : selectedLyrics.id,
                manual_lrc: selectedLyrics.id === 'MANUAL' ? selectedLyrics.syncedLyrics : null,
                ...params
            };

            // 1. Submit Job
            const res = await axios.post("/generate", payload);
            const jobId = res.data.job_id;

            if (!jobId) {
                throw new Error("No job ID received");
            }

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await axios.get(`/status/${jobId}`);
                    const job = statusRes.data;

                    if (job.status === 'queued') {
                        setStatusMessage(`Queued (Position: ${job.position})`);
                    } else if (job.status === 'processing') {
                        setStatusMessage("Processing Video... (This may take a minute)");
                    } else if (job.status === 'completed') {
                        clearInterval(pollInterval);
                        setStatusMessage("Done!");
                        setLoading(false);
                        if (job.result) {
                            onGenerate(job.result);
                        }
                    } else if (job.status === 'failed') {
                        clearInterval(pollInterval);
                        setStatusMessage(`Failed: ${job.error}`);
                        setLoading(false);
                        alert(`Generation Failed: ${job.error}`);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                    // Don't clear interval immediately on transient network errors, but maybe count them
                }
            }, 2000); // Check every 2 seconds

        } catch (e) {
            console.error(e);
            setLoading(false);
            setStatusMessage("Error submitting request");
            alert("Failed to submit request");
        }
    };

    const disabled = !selectedVideo || !selectedLyrics;

    return (
        <div className={`mt-6 space-y-4 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <hr className="border-t border-dashed border-black" />

            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Start (1:00)"
                    className="flex-1 p-2 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                    value={params.start_time}
                    onChange={e => setParams({ ...params, start_time: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="End (1:15)"
                    className="flex-1 p-2 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                    value={params.end_time}
                    onChange={e => setParams({ ...params, end_time: e.target.value })}
                />
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1">Lo-Fi Level: {params.lofi}</label>
                    <input
                        type="range" min="1" max="20"
                        className="w-full accent-black"
                        value={params.lofi}
                        onChange={e => setParams({ ...params, lofi: parseInt(e.target.value) })}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1">Font Size</label>
                    <input
                        type="number"
                        className="w-full p-2 border border-black font-mono"
                        value={params.fontsize}
                        onChange={e => setParams({ ...params, fontsize: parseInt(e.target.value) })}
                    />
                </div>
                <div className="w-20">
                    <label className="block text-xs font-bold mb-1">BG</label>
                    <input
                        type="color"
                        className="w-full h-10 border border-black"
                        value={params.bgcolor}
                        onChange={e => setParams({ ...params, bgcolor: e.target.value })}
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-black text-white p-4 font-bold text-xl hover:scale-[1.01] transition-transform shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[5px] active:translate-y-[5px]"
            >
                {loading ? (statusMessage || "Loading...") : "GENERATE VIDEO"}
            </button>
        </div>
    );
}
