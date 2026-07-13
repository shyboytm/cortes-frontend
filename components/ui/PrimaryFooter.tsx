import Image from "next/image";
import Link from "next/link";
import { SiLastdotfm } from "@icons-pack/react-simple-icons";
import { getNowPlaying } from "@/lib/lastfm";

export default async function PrimaryFooter() {
  const track = await getNowPlaying();

  return (
    <footer className="border-t border-black/10 px-12 py-10 dark:border-white/10">
      <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="dot-font font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
          © {new Date().getFullYear()} Dennis Cortés
        </p>

        {track && (
          <Link
            href={track.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-md border border-black/10 pl-3 pr-5 py-3 transition-colors hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            {track.imageUrl ? (
              <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-sm border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                <Image
                  src={track.imageUrl}
                  alt={track.album || track.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-black/10 bg-black/5 text-black/30 dark:border-white/10 dark:bg-white/5 dark:text-white/30">
                <SiLastdotfm size={16} />
              </div>
            )}

            <div className="flex flex-col overflow-hidden">
              <span className="dot-font font-doto text-[10px] tracking-widest text-green-800 uppercase dark:text-green-400">
                {track.isNowPlaying ? "Now Playing" : "Last Played"}
              </span>
              <span className="max-w-[300px] truncate text-sm text-black dark:text-white">{track.title}</span>
              <span className="max-w-[300px] truncate text-xs text-black/50 dark:text-white/50">
                {track.artist}
              </span>
            </div>
          </Link>
        )}
      </div>
    </footer>
  );
}
