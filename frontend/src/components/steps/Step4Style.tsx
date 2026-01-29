
import { useState, useEffect } from "react";
import axios from "axios";
import type { VideoResult, LyricsResult, TimeRange } from "../../types";

interface Step4Props {
    selectedVideo: VideoResult;
    selectedLyrics: LyricsResult;
    timeRange: TimeRange;
    onBack: () => void;
    onSuccess: (videoUrl: string) => void;
}

export default function Step4Style({ selectedVideo, selectedLyrics, timeRange, onBack, onSuccess }: Step4Props) {
    const [params, setParams] = useState({
        lofi: 5,
        fontsize: 400,
        bgcolor: "#FFFFFF",
        textColor: "#000000"
    });

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("brat_settings");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setParams(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem("brat_settings", JSON.stringify(params));
    }, [params]);

    const handleGenerate = async () => {
        setLoading(true);
        setStatusMessage("Submitting request...");

        try {
            const payload = {
                song: selectedLyrics.name || "Unknown",
                artist: selectedLyrics.artist || "Unknown",
                video_id: selectedVideo.id,
                // Handle Manual Input (id='MANUAL') or real ID
                lyrics_id: selectedLyrics.id === 'MANUAL' ? null : selectedLyrics.id,
                manual_lrc: selectedLyrics.id === 'MANUAL' ? selectedLyrics.syncedLyrics : null,
                start_time: timeRange.start,
                end_time: timeRange.end,
                ...params
            };

            const res = await axios.post("/generate", payload);
            const jobId = res.data.job_id;

            if (!jobId) throw new Error("No job ID received");

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
                        if (job.result) onSuccess(job.result);
                    } else if (job.status === 'failed') {
                        clearInterval(pollInterval);
                        setStatusMessage(`Failed: ${job.error}`);
                        setLoading(false);
                        alert(`Generation Failed: ${job.error}`);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 2000);

        } catch (e) {
            console.error(e);
            setLoading(false);
            setStatusMessage("Error submitting request");
            alert("Failed to submit request");
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-white inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    STEP 4: STYLE & GENERATE
                </h2>
                <button onClick={onBack} disabled={loading} className="underline hover:bg-[#8ace00] px-1 font-mono disabled:opacity-50">
                    &lt; BACK
                </button>
            </div>

            <div className="bg-[#eee] p-6 border-2 border-black space-y-6">
                <div>
                    <label className="block font-bold mb-2">Lo-Fi Level: {params.lofi}</label>
                    <input
                        type="range" min="1" max="20"
                        className="w-full accent-black h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        value={params.lofi}
                        onChange={e => setParams({ ...params, lofi: parseInt(e.target.value) })}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block font-bold mb-2">Font Size</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                            value={params.fontsize}
                            onChange={e => setParams({ ...params, fontsize: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-bold mb-2">Background</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                className="w-12 h-12 border border-black p-0"
                                value={params.bgcolor}
                                onChange={e => setParams({ ...params, bgcolor: e.target.value })}
                            />
                            <span className="font-mono text-sm">{params.bgcolor}</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block font-bold mb-2">Text Color</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                className="w-12 h-12 border border-black p-0"
                                value={params.textColor}
                                onChange={e => setParams({ ...params, textColor: e.target.value })}
                            />
                            <span className="font-mono text-sm">{params.textColor}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-dashed border-gray-400 p-4 font-mono text-sm">
                <p><strong>Config Summary:</strong></p>
                <p>Song: {selectedLyrics.name} - {selectedLyrics.artist}</p>
                <p>Video: {selectedVideo.title}</p>
                <p>Time: {timeRange.start} - {timeRange.end}</p>
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-black text-white p-4 font-bold text-xl hover:scale-[1.01] transition-transform shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-1.25 active:translate-y-1.25 active:shadow-none disabled:opacity-75 disabled:cursor-not-allowed"
            >
                {loading ? (statusMessage || "GENERATING...") : "GENERATE VIDEO"}
            </button>
        </div>
    );
}
