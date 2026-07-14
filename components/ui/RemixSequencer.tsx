'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, Shuffle, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = 16;

type LaneId = 'kick' | 'snare' | 'hat' | 'perc';

const LANES: { id: LaneId; label: string }[] = [
  { id: 'kick', label: 'Kick' },
  { id: 'snare', label: 'Snare' },
  { id: 'hat', label: 'Hat' },
  { id: 'perc', label: 'Perc' },
];

const emptyLane = () => Array(STEPS).fill(false);

const DEFAULT_PATTERN: Record<LaneId, boolean[]> = {
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  hat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
  perc: emptyLane(),
};

type PadId = 'track1' | 'track2' | 'track3';

const PAD_LABELS: { id: PadId; label: string }[] = [
  { id: 'track1', label: 'Track 1' },
  { id: 'track2', label: 'Track 2' },
  { id: 'track3', label: 'Track 3' },
];

type SongId = 'chips-2une' | 'unosage' | 'refusal';

type Song = {
  id: SongId;
  label: string;
  bpm: number;
  urls: Record<PadId, string>;
};

// Each song is three real stems (one per pad), all the same length and
// tempo-locked to the song's own BPM (verified against each file's actual
// duration when they were dropped in — 4 bars at each song's tempo).
const SONGS: Song[] = [
  {
    id: 'chips-2une',
    label: "Chip's 2une",
    bpm: 100,
    urls: {
      track1: '/music/chips-2une-track-1.wav',
      track2: '/music/chips-2une-track-2.wav',
      track3: '/music/chips-2une-track-3.wav',
    },
  },
  {
    id: 'unosage',
    label: 'Unosage',
    bpm: 66,
    urls: {
      track1: '/music/unosage-track-1.wav',
      track2: '/music/unosage-track-2.wav',
      track3: '/music/unosage-track-3.wav',
    },
  },
  {
    id: 'refusal',
    label: 'Refusal',
    bpm: 152,
    urls: {
      track1: '/music/refusal-track-1.wav',
      track2: '/music/refusal-track-2.wav',
      track3: '/music/refusal-track-3.wav',
    },
  },
];

const emptyPads = (): Record<PadId, boolean> => ({ track1: false, track2: false, track3: false });

// The three pads are real stems — Tone.Player instances synced to the
// Transport so toggling a pad just mutes/unmutes it in place rather than
// restarting playback. Which song's stems are loaded (and the Transport's
// BPM) is driven by the dropdown; switching songs stops playback, disposes
// the old players, and loads the new ones in at that song's own tempo.
export default function RemixSequencer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState<Record<LaneId, boolean[]>>(DEFAULT_PATTERN);
  const [activePads, setActivePads] = useState<Record<PadId, boolean>>(emptyPads());
  const [songId, setSongId] = useState<SongId>(SONGS[0].id);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  // setup() below is only ever really executed once (it early-returns after
  // that), so if it read `songId` directly it would close over whatever
  // song was selected on the very first render — a stale value — instead
  // of whatever's currently picked in the dropdown. A ref sidesteps that.
  const songIdRef = useRef(songId);
  songIdRef.current = songId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthsRef = useRef<Record<LaneId, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loopsRef = useRef<Record<PadId, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sequenceRef = useRef<any>(null);

  // (Re)creates the three stem players for whichever song is passed in,
  // disposing any previous set first. Shared by the initial setup and by
  // switching songs later.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadSong = useCallback(async (Tone: any, song: Song) => {
    if (loopsRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.values(loopsRef.current).forEach((player: any) => player.dispose());
      loopsRef.current = null;
    }

    const players = Object.fromEntries(
      PAD_LABELS.map((pad) => [pad.id, new Tone.Player({ url: song.urls[pad.id], loop: true }).toDestination()])
    ) as Record<PadId, InstanceType<typeof Tone.Player>>;

    await Tone.loaded();

    loopsRef.current = players;
    Object.values(players).forEach((player) => {
      player.mute = true;
      player.sync().start(0);
    });

    Tone.getTransport().bpm.value = song.bpm;
    setActivePads(emptyPads());
  }, []);

  // Builds the whole audio graph exactly once, on the first Play/pad click —
  // importing Tone lazily keeps it out of the server render entirely, and
  // Tone.start() has to happen inside a real user gesture for the browser
  // to allow audio at all.
  const setup = useCallback(async () => {
    if (toneRef.current) return toneRef.current;
    const Tone = await import('tone');
    await Tone.start();

    // Real one-shot drum samples instead of synthesized hits. Tone.Sampler
    // (rather than Tone.Player) is what handles rapid retriggering safely —
    // each triggerAttack spawns its own internal voice, so a step landing
    // on the same 16th twice in a row (or two lanes overlapping) doesn't
    // fight over a single player instance the way reusing one Tone.Player
    // would. Each sampler only has one sample, so the note name used to
    // trigger it ('C1') is arbitrary — it's just a key into the urls map.
    const kick = new Tone.Sampler({ urls: { C1: '/music/drums/kick.wav' } }).toDestination();
    const snare = new Tone.Sampler({ urls: { C1: '/music/drums/snare.wav' } }).toDestination();
    const hat = new Tone.Sampler({ urls: { C1: '/music/drums/hat.wav' } }).toDestination();
    const perc = new Tone.Sampler({ urls: { C1: '/music/drums/perc.wav' } }).toDestination();

    await Tone.loaded();

    synthsRef.current = { kick, snare, hat, perc };

    const seq = new Tone.Sequence(
      (time: number, step: number) => {
        const g = gridRef.current;
        if (g.kick[step]) kick.triggerAttack('C1', time);
        if (g.snare[step]) snare.triggerAttack('C1', time);
        if (g.hat[step]) hat.triggerAttack('C1', time);
        if (g.perc[step]) perc.triggerAttack('C1', time);
        setCurrentStep(step);
      },
      Array.from({ length: STEPS }, (_, i) => i),
      '16n'
    );
    seq.start(0);
    sequenceRef.current = seq;

    toneRef.current = Tone;
    await loadSong(Tone, SONGS.find((s) => s.id === songIdRef.current) ?? SONGS[0]);
    return Tone;
  }, [loadSong]);

  useEffect(() => {
    return () => {
      sequenceRef.current?.dispose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (loopsRef.current) Object.values(loopsRef.current).forEach((l: any) => l.dispose());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (synthsRef.current) Object.values(synthsRef.current).forEach((s: any) => s.dispose());
      if (toneRef.current) {
        const transport = toneRef.current.getTransport();
        transport.stop();
        transport.cancel();
      }
    };
  }, []);

  const togglePlay = async () => {
    const Tone = await setup();
    const transport = Tone.getTransport();
    if (isPlaying) {
      transport.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      transport.start();
      setIsPlaying(true);
    }
  };

  const toggleStep = (lane: LaneId, step: number) => {
    setGrid((prev) => ({
      ...prev,
      [lane]: prev[lane].map((v, i) => (i === step ? !v : v)),
    }));
  };

  const togglePad = async (pad: PadId) => {
    await setup();
    setActivePads((prev) => {
      const next = { ...prev, [pad]: !prev[pad] };
      if (loopsRef.current) loopsRef.current[pad].mute = !next[pad];
      return next;
    });
  };

  const changeSong = async (nextSongId: SongId) => {
    setSongId(nextSongId);
    const song = SONGS.find((s) => s.id === nextSongId);
    if (!song) return;

    // Switching songs mid-playback would leave stems from two different
    // tempos/tracks briefly overlapping, so stop the transport first.
    if (toneRef.current) {
      const transport = toneRef.current.getTransport();
      if (isPlaying) {
        transport.stop();
        setIsPlaying(false);
        setCurrentStep(-1);
      }
      await loadSong(toneRef.current, song);
    }
    // If audio hasn't been initialized yet, setup() will load whichever
    // song is selected (via `songId` state) the first time Play/a pad is
    // pressed — nothing else to do here.
  };

  const clearGrid = () => {
    setGrid({ kick: emptyLane(), snare: emptyLane(), hat: emptyLane(), perc: emptyLane() });
  };

  const randomize = () => {
    const randomLane = (density: number) => Array.from({ length: STEPS }, () => Math.random() < density);
    setGrid({
      kick: randomLane(0.25),
      snare: randomLane(0.15),
      hat: randomLane(0.4),
      perc: randomLane(0.12),
    });
  };

  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 sm:p-6 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-white transition-transform hover:scale-105 dark:bg-green-500"
            aria-label={isPlaying ? 'Stop' : 'Play'}
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <span className="dot-font font-doto text-xs tracking-widest text-black/50 uppercase dark:text-white/50">
            {isPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>

        <label className="flex items-center gap-2">
          <span className="dot-font font-doto text-xs tracking-widest text-black/40 uppercase dark:text-white/40">
            Song
          </span>
          <div className="relative">
            {/* Native select arrows aren't inset evenly with the rest of
                the pill's padding — appearance-none drops the built-in one
                so this custom chevron can sit at the same inset as the
                left-side text. */}
            <select
              value={songId}
              onChange={(e) => changeSong(e.target.value as SongId)}
              className="appearance-none rounded-full border border-black/10 bg-transparent py-1.5 pr-8 pl-3 text-xs tracking-widest text-black/70 uppercase transition-colors hover:border-black/30 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30"
            >
              {SONGS.map((song) => (
                <option key={song.id} value={song.id} className="bg-white text-black dark:bg-black dark:text-white">
                  {song.label} — {song.bpm} BPM
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-black/50 dark:text-white/50"
            />
          </div>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs tracking-widest text-black/60 uppercase transition-colors hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white"
          >
            <Shuffle size={13} /> Shuffle
          </button>
          <button
            type="button"
            onClick={clearGrid}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs tracking-widest text-black/60 uppercase transition-colors hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white"
          >
            <RotateCcw size={13} /> Clear
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PAD_LABELS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            onClick={() => togglePad(pad.id)}
            className={cn(
              'rounded-md border px-4 py-3 text-left text-sm tracking-wide transition-colors',
              activePads[pad.id]
                ? 'border-green-800 bg-green-800/10 text-green-800 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400'
                : 'border-black/10 text-black/50 hover:text-black dark:border-white/10 dark:text-white/50 dark:hover:text-white'
            )}
          >
            {pad.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {LANES.map((lane) => (
          <div key={lane.id} className="flex items-center gap-3">
            <span className="dot-font font-doto w-12 shrink-0 text-[11px] tracking-widest text-black/40 uppercase dark:text-white/40">
              {lane.label}
            </span>
            <div className="grid flex-1 grid-cols-[repeat(16,minmax(0,1fr))] gap-1">
              {grid[lane.id].map((active, step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => toggleStep(lane.id, step)}
                  aria-label={`${lane.label} step ${step + 1}`}
                  className={cn(
                    'aspect-square rounded-[3px] transition-colors',
                    active ? 'bg-green-800 dark:bg-green-400' : 'bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20',
                    currentStep === step && isPlaying && 'ring-2 ring-black/40 dark:ring-white/60'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-black/40 dark:text-white/40">
        Toggle steps to build a beat, tap the pads to layer in the three stems from{' '}
        {SONGS.find((s) => s.id === songId)?.label} — then hit play.
      </p>
    </div>
  );
}
