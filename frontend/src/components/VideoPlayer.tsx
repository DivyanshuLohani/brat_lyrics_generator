export default function VideoPlayer({ url }: { url: string }) {
    if (!url) return null;
    return (
        <div className="mt-8 border-2 border-black p-2 bg-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)]">
            <video
                src={url}
                controls
                autoPlay
                className="w-full border border-white/20"
            />
            <div className="mt-2 text-center">
                <a
                    href={url}
                    download
                    className="inline-block bg-[#8ace00] text-black font-bold px-4 py-2 hover:bg-white"
                >
                    DOWNLOAD VIDEO
                </a>
            </div>
        </div>
    );
}
