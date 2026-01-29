
import { useState, useEffect } from "react";
import axios from "axios";
import type { LyricsResult } from "../../types";

interface Step2Props {
    initialLyrics: LyricsResult[];
    initialQuery?: string;
    onNext: (lyrics: LyricsResult) => void;
    onBack: () => void;
}

export default function Step2Lyrics({ initialLyrics, initialQuery, onNext, onBack }: Step2Props) {
    const [results, setResults] = useState<LyricsResult[]>(initialLyrics);
    const [query, setQuery] = useState(initialQuery || "");
    const [loading, setLoading] = useState(false);
    const [manualText, setManualText] = useState("");
    const [mode, setMode] = useState<'search' | 'manual'>('search');

    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        setResults(initialLyrics);
        if (initialLyrics.length > 0) {
            setHasSearched(true);
        }
    }, [initialLyrics]);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setHasSearched(true);
        try {
            const res = await axios.get(`/search/lyrics?q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = () => {
        if (!manualText.trim()) return;
        onNext({
            id: 'MANUAL',
            name: 'Manual Input',
            artist: 'Unknown',
            syncedLyrics: manualText
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-white inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    STEP 2: SELECT LYRICS
                </h2>
                <button onClick={onBack} className="underline hover:bg-[#8ace00] px-1 font-mono">
                    &lt; BACK
                </button>
            </div>

            <div className="flex gap-4 border-b-2 border-black pb-4">
                <button
                    className={`font-bold pb-1 ${mode === 'search' ? 'border-b-4 border-[#8ace00]' : 'opacity-50'}`}
                    onClick={() => setMode('search')}
                >
                    SEARCH
                </button>
                <button
                    className={`font-bold pb-1 ${mode === 'manual' ? 'border-b-4 border-[#8ace00]' : 'opacity-50'}`}
                    onClick={() => setMode('manual')}
                >
                    MANUAL INPUT
                </button>
            </div>

            {mode === 'search' && (
                <>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            className="flex-3 w-full p-3 border-2 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#8ace00]/50"
                            placeholder="Data - Arca..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-black text-white font-bold p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(138,206,0,1)] transition-all min-w-30"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : (
                                "SEARCH"
                            )}
                        </button>
                    </div>

                    <div className="grid gap-2 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                        {loading && (
                            <div className="space-y-2 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="border border-gray-200 p-3 opacity-50">
                                        <div className="h-5 bg-gray-300 w-1/2 mb-2" />
                                        <div className="h-3 bg-gray-300 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && results.map((l, i) => (
                            <div
                                key={`${l.artist}-${l.name}-${i}`} // sometimes ID is missing/dupe
                                className="border border-black p-3 hover:bg-[#8ace00] cursor-pointer transition-colors"
                                onClick={() => onNext(l)}
                            >
                                <h3 className="font-bold">{l.name}</h3>
                                <p className="text-sm font-mono">{l.artist}</p>
                            </div>
                        ))}

                        {!loading && hasSearched && results.length === 0 && (
                            <p className="text-center text-gray-500">No lyrics found. Try searching again or use Manual Input.</p>
                        )}
                    </div>
                </>
            )}

            {mode === 'manual' && (
                <div className="flex flex-col gap-4">
                    <textarea
                        className="w-full h-64 p-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#8ace00]/50"
                        placeholder="[00:12.00] Ly-rics..."
                        value={manualText}
                        onChange={e => setManualText(e.target.value)}
                    />
                    <button
                        onClick={handleManualSubmit}
                        className="bg-black text-white font-bold p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(138,206,0,1)] transition-all"
                    >
                        USE ACTIONS
                    </button>
                </div>
            )}
        </div>
    );
}
