import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import type { HistoryItem } from "../types";

export default function History() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/history")
            .then(res => setHistory(res.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold italic">Generation History</h2>
                <Link to="/" className="text-sm underline">Back to Generator</Link>
            </div>

            {loading && <div>Loading...</div>}

            {!loading && (
                <div className="border border-black">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="p-2 border border-black">Time</th>
                                <th className="p-2 border border-black">Song</th>
                                <th className="p-2 border border-black">Artist</th>
                                <th className="p-2 border border-black">Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-100">
                                    <td className="p-2 border border-gray-300 font-mono text-xs">{new Date(row.created_at).toLocaleString()}</td>
                                    <td className="p-2 border border-gray-300">{row.song}</td>
                                    <td className="p-2 border border-gray-300">{row.artist}</td>
                                    <td className="p-2 border border-gray-300">
                                        <a href={`/generated/${row.filename}`} download className="font-bold underline text-[#8ace00] bg-black px-2 py-1">
                                            DL
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">No history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
