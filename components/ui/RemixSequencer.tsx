'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sequence } from 'tone';
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
    label: 'R3fusal',
    bpm: 76,
    urls: {
      track1: '/music/refusal-track-1.wav',
      track2: '/music/refusal-track-2.wav',
      track3: '/music/refusal-track-3.wav',
    },
  },
];

const defaultPads = (): Record<PadId, boolean> => ({ track1: true, track2: false, track3: false });

type ToneModule = typeof import('tone');

export default function RemixSequencer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState<Record<LaneId, boolean[]>>(DEFAULT_PATTERN);
  const [activePads, setActivePads] = useState<Record<PadId, boolean>>(defaultPads());
  const [songId, setSongId] = useState<SongId>(SONGS[0].id);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const songIdRef = useRef(songId);
  songIdRef.current = songId;

  const toneRef = useRef<ToneModule | null>(null);
  const synthsRef = useRef<Record<LaneId, InstanceType<ToneModule['Sampler']>> | null>(null);
  const loopsRef = useRef<Record<PadId, InstanceType<ToneModule['Player']>> | null>(null);
  const sequenceRef = useRef<Sequence<number> | null>(null);
  const setupPromiseRef = useRef<Promise<ToneModule> | null>(null);
  const preloadStartedRef = useRef(false);

  const loadSong = useCallback(async (Tone: ToneModule, song: Song) => {
    if (loopsRef.current) {
      Object.values(loopsRef.current).forEach((player) => player.dispose());
      loopsRef.current = null;
    }

    const players = Object.fromEntries(
      PAD_LABELS.map((pad) => [pad.id, new Tone.Player({ url: song.urls[pad.id], loop: true }).toDestination()])
    ) as Record<PadId, InstanceType<typeof Tone.Player>>;

    await Tone.loaded();

    loopsRef.current = players;
    const defaults = defaultPads();
    Object.entries(players).forEach(([padId, player]) => {
      player.mute = !defaults[padId as PadId];
      player.sync().start(0);
    });

    Tone.getTransport().bpm.value = song.bpm;
    setActivePads(defaults);
  }, []);

  const setup = useCallback(async () => {
    if (toneRef.current) return toneRef.current;
    if (setupPromiseRef.current) return setupPromiseRef.current;

    const buildPromise = (async () => {
      const Tone = await import('tone');
      await Tone.start();

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
    })();

    setupPromiseRef.current = buildPromise;

    try {
      return await buildPromise;
    } catch (err) {
      setupPromiseRef.current = null;
      throw err;
    } finally {
      if (toneRef.current) setupPromiseRef.current = null;
    }
  }, [loadSong]);

  const preloadTone = useCallback(() => {
    if (preloadStartedRef.current) return;
    preloadStartedRef.current = true;
    import('tone').catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      sequenceRef.current?.dispose();
      if (loopsRef.current) Object.values(loopsRef.current).forEach((l) => l.dispose());
      if (synthsRef.current) Object.values(synthsRef.current).forEach((s) => s.dispose());
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

    if (toneRef.current) {
      const transport = toneRef.current.getTransport();
      if (isPlaying) {
        transport.stop();
        setIsPlaying(false);
        setCurrentStep(-1);
      }
      await loadSong(toneRef.current, song);
    }
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
    <div onPointerEnter={preloadTone} onFocus={preloadTone}>
      <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 sm:p-6 dark:border-white/10 dark:bg-white/[0.03] shadow-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              data-cuelume-hover="tick"
              data-cuelume-press
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-purple-800 text-white transition-transform hover:scale-105 dark:bg-purple-500"
              aria-label={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? <Square size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <span className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              {isPlaying ? 'Playing' : 'Stopped'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={randomize}
              data-cuelume-hover="tick"
              data-cuelume-press
              className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs tracking-widest text-black/60 uppercase transition-colors hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white"
            >
              <Shuffle size={13} /> Shuffle
            </button>
            <button
              type="button"
              onClick={clearGrid}
              data-cuelume-hover="tick"
              data-cuelume-press
              className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs tracking-widest text-black/60 uppercase transition-colors hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white"
            >
              <RotateCcw size={13} /> Clear
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label className="flex shrink-0 items-center gap-2">
            <span className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              Song
            </span>
            <div className="relative">
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
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-black/60 dark:text-white/60"
              />
            </div>
          </label>

          <div aria-hidden className="hidden h-6 w-px bg-black/10 sm:block dark:bg-white/10" />

          <div className="flex flex-1 items-center gap-2">
            <span className="dot-font font-doto text-xs tracking-widest text-black/60 uppercase dark:text-white/60">
              Stems
            </span>
            {PAD_LABELS.map((pad) => (
              <button
                key={pad.id}
                type="button"
                onClick={() => togglePad(pad.id)}
                data-cuelume-hover="tick"
                data-cuelume-press
                className={cn(
                  'flex-1 cursor-pointer rounded-full border px-3 py-1.5 text-center text-xs tracking-widest uppercase transition-colors',
                  activePads[pad.id]
                    ? 'border-purple-800 bg-purple-800/10 text-purple-800 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-400'
                    : 'border-black/10 text-black/60 hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white'
                )}
              >
                {pad.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 border-t border-black/10 dark:border-white/10" />

        <div className="flex flex-col gap-3">
          {LANES.map((lane) => (
            <div key={lane.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="dot-font font-doto text-[11px] tracking-widest text-black/60 uppercase sm:w-12 sm:shrink-0 dark:text-white/60">
                {lane.label}
              </span>
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 sm:flex-1">
                {grid[lane.id].map((active, step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => toggleStep(lane.id, step)}
                    aria-label={`${lane.label} step ${step + 1}`}
                    className={cn(
                      'aspect-square cursor-pointer rounded-[3px] transition-colors',
                      active ? 'bg-purple-800 dark:bg-purple-400' : 'bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20',
                      currentStep === step && isPlaying && 'ring-2 ring-black/40 dark:ring-white/60'
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
      
      <p className="mt-6 text-xs text-center text-black/60 dark:text-white/60">
        <b className="dark:text-white text-black mr-2">How do I use this?</b> Choose a song, turn on or off stems from the song{' '}
        {SONGS.find((s) => s.id === songId)?.label}, toggle pads to build a drum beat, then hit play.
      </p>

    </div>
  );
}
