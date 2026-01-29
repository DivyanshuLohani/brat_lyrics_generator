
import { useState } from "react";
import type { LyricLine, TimeRange } from "../../types";

interface Step3Props {
    lines: LyricLine[];
    onNext: (timeRange: TimeRange) => void;
    onBack: () => void;
}

export default function Step3Sync({ lines, onNext, onBack }: Step3Props) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>({ start: "0:00", end: "0:15" });

    // Helper to format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const updateTimeRange = (indices: number[]) => {
        if (indices.length === 0) return;
        const startIdx = indices[0];
        const endIdx = indices.length === 2 ? indices[1] : startIdx;
        const startTime = lines[startIdx].time;
        let endTime;
        if (endIdx + 1 < lines.length) {
            endTime = lines[endIdx + 1].time;
        } else {
            endTime = lines[endIdx].time + 5.0; // Default 5s duration if last line
        }
        setTimeRange({
            start: formatTime(startTime),
            end: formatTime(endTime)
        });
    };

    const toggleLine = (index: number) => {
        let newSelection: number[] = [];
        if (selectedIndices.length === 0) {
            newSelection = [index];
        } else if (selectedIndices.length === 1) {
            const start = selectedIndices[0];
            const end = index;
            newSelection = [Math.min(start, end), Math.max(start, end)];
        } else {
            // Reset
            newSelection = [index];
        }
        setSelectedIndices(newSelection);
        updateTimeRange(newSelection);
    };

    const isSelected = (index: number) => {
        if (selectedIndices.length === 0) return false;
        if (selectedIndices.length === 1) return index === selectedIndices[0];
        return index >= selectedIndices[0] && index <= selectedIndices[1];
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-white inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    STEP 3: SYNC & TRIM
                </h2>
                <button onClick={onBack} className="underline hover:bg-[#8ace00] px-1 font-mono">
                    &lt; BACK
                </button>
            </div>

            <p className="font-mono text-sm">
                Select the lines you want to include in the video. Click first line, then last line.
            </p>

            <div className="border-2 border-black flex-1 min-h-75 max-h-125 overflow-y-auto bg-gray-50 custom-scrollbar">
                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        onClick={() => toggleLine(idx)}
                        className={`p-2 px-3 border-b border-gray-200 text-sm font-mono cursor-pointer transition-colors hover:bg-gray-200 ${isSelected(idx) ? 'bg-[#8ace00] font-bold border-l-4 border-l-black' : ''}`}
                    >
                        <span className="inline-block w-12 text-gray-500 text-xs mr-2 border-r border-gray-300 pr-2">
                            {formatTime(line.time)}
                        </span>
                        {line.text || "♫"}
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-black bg-[#eee]">
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1">START</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                        value={timeRange.start}
                        onChange={e => setTimeRange({ ...timeRange, start: e.target.value })}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold mb-1">END</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                        value={timeRange.end}
                        onChange={e => setTimeRange({ ...timeRange, end: e.target.value })}
                    />
                </div>
            </div>

            <button
                onClick={() => onNext(timeRange)}
                className="w-full bg-black text-white p-4 font-bold text-xl hover:scale-[1.01] transition-transform shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-1.25 active:translate-y-1.25 active:shadow-none"
            >
                NEXT: STYLE
            </button>
        </div>
    );
}
