import { useState } from "react";
import axios from "axios";
import type { VideoResult, LyricsResult } from "../types";

export default function Search({ onSearchResults }: {
    onSearchResults: (
        vidRes: VideoResult[],
        lyrRes: LyricsResult[]
    ) => void
}) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const [vidRes, lyrRes] = await Promise.all([
                axios.get(`/search/video?q=${encodeURIComponent(query)}`),
                axios.get(`/search/lyrics?q=${encodeURIComponent(query)}`)
            ]);
            onSearchResults(vidRes.data, lyrRes.data);

        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                className="flex-3 w-full p-3 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#8ace00]"
                placeholder="Enter Song and Artist (e.g. Apple - Charli xcx)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-black text-white font-bold p-3 hover:opacity-80 disabled:opacity-50"
            >
                {loading ? "SEARCHING..." : "SEARCH"}
            </button>
        </div>
    );
}
