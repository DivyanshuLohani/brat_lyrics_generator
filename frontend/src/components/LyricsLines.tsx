import { useState, useEffect } from "react";
import type { LyricLine, TimeRange } from "../types";

interface LyricsLinesProps {
    lines: LyricLine[];
    onTimeUpdate: (range: TimeRange) => void;
}

export default function LyricsLines({ lines, onTimeUpdate }: LyricsLinesProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const toggleLine = (index: number) => {
        let newSelection: number[] = [];
        if (selectedIndices.length === 0) {
            newSelection = [index];
        } else if (selectedIndices.length === 1) {
            const start = selectedIndices[0];
            const end = index;
            newSelection = [Math.min(start, end), Math.max(start, end)];
        } else {
            newSelection = [index];
        }
        setSelectedIndices(newSelection);
    };

    const isSelected = (index: number) => {
        if (selectedIndices.length === 0) return false;
        if (selectedIndices.length === 1) return index === selectedIndices[0];
        return index >= selectedIndices[0] && index <= selectedIndices[1];
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (selectedIndices.length === 0) return;

        const startIdx = selectedIndices[0];
        const endIdx = selectedIndices.length === 2 ? selectedIndices[1] : startIdx;

        const startTime = lines[startIdx].time;

        let endTime;
        if (endIdx + 1 < lines.length) {
            endTime = lines[endIdx + 1].time;
        } else {
            endTime = lines[endIdx].time + 5.0;
        }

        onTimeUpdate({
            start: formatTime(startTime),
            end: formatTime(endTime)
        });

    }, [selectedIndices, lines, onTimeUpdate]);


    return (
        <div className="border border-gray-300 flex flex-col h-75 mt-4">
            <h3 className="font-bold border-b border-black p-2 bg-[#eee]">3. Select Lines (Click start & end)</h3>
            <div className="overflow-y-auto flex-1 bg-[#f9f9f9]">
                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        onClick={() => toggleLine(idx)}
                        className={`p-1 px-3 border-b border-gray-100 text-sm font-mono cursor-pointer hover:bg-gray-200 ${isSelected(idx) ? 'bg-[#8ace00] font-bold' : ''}`}
                    >
                        {line.text || "♫"}
                    </div>
                ))}
            </div>
        </div>
    );
}
