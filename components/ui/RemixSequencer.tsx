'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, Shuffle, RotateCcw } from 'lucide-react';
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

type PadId = 'bass' | 'chords' | 'lead';

const PADS: { id: PadId; label: string }[] = [
  { id: 'bass', label: 'Bass Loop' },
  { id: 'chords', label: 'Chord Loop' },
  { id: 'lead', label: 'Lead Loop' },
];

// Instruments are all synthesized for now — this is a scaffold for a real
// stem-based remix toy. Once actual Cordio loop/one-shot files are dropped
// in, the synths below get swapped for Tone.Player instances pointed at
// those files; the sequencing/pad-toggle logic stays the same.
export default function RemixSequencer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState<Record<LaneId, boolean[]>>(DEFAULT_PATTERN);
  const [activePads, setActivePads] = useState<Record<PadId, boolean>>({
    bass: false,
    chords: false,
    lead: false,
  });

  const gridRef = useRef(grid);
  gridRef.current = grid;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthsRef = useRef<Record<LaneId, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loopsRef = useRef<Record<PadId, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sequenceRef = useRef<any>(null);

  // Builds the whole audio graph exactly once, on the first Play/pad click —
  // importing Tone lazily keeps it out of the server render entirely, and
  // Tone.start() has to happen inside a real user gesture for the browser
  // to allow audio at all.
  const setup = useCallback(async () => {
    if (toneRef.current) return toneRef.current;
    const Tone = await import('tone');
    await Tone.start();

    const kick = new Tone.MembraneSynth({ octaves: 4, pitchDecay: 0.02 }).toDestination();
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
    }).toDestination();
    const hat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
    }).toDestination();
    const perc = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();

    hat.volume.value = -16;
    snare.volume.value = -6;
    perc.volume.value = -8;

    synthsRef.current = { kick, snare, hat, perc };

    const bassSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.3 },
    }).toDestination();
    bassSynth.volume.value = -10;

    const chordSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    chordSynth.volume.value = -18;

    const leadSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.4 },
    }).toDestination();
    leadSynth.volume.value = -16;

    const eighth = Tone.Time('8n').toSeconds();

    const bassLoop = new Tone.Loop((time: number) => {
      bassSynth.triggerAttackRelease('E2', '8n', time);
      bassSynth.triggerAttackRelease('E2', '8n', time + eighth * 4);
    }, '1m');

    const chordLoop = new Tone.Loop((time: number) => {
      chordSynth.triggerAttackRelease(['E3', 'G3', 'B3'], '2n', time);
    }, '1m');

    const leadLoop = new Tone.Loop((time: number) => {
      ['E4', 'G4', 'B4', 'D5'].forEach((note, i) => {
        leadSynth.triggerAttackRelease(note, '16n', time + i * eighth);
      });
    }, '1m');

    loopsRef.current = { bass: bassLoop, chords: chordLoop, lead: leadLoop };
    [bassLoop, chordLoop, leadLoop].forEach((loop) => {
      loop.mute = true;
      loop.start(0);
    });

    const seq = new Tone.Sequence(
      (time: number, step: number) => {
        const g = gridRef.current;
        if (g.kick[step]) kick.triggerAttackRelease('C1', '8n', time);
        if (g.snare[step]) snare.triggerAttackRelease('8n', time);
        if (g.hat[step]) hat.triggerAttackRelease('16n', time);
        if (g.perc[step]) perc.triggerAttackRelease('A4', '16n', time);
        setCurrentStep(step);
      },
      Array.from({ length: STEPS }, (_, i) => i),
      '16n'
    );
    seq.start(0);
    sequenceRef.current = seq;

    Tone.getTransport().bpm.value = 100;

    toneRef.current = Tone;
    return Tone;
  }, []);

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
        {PADS.map((pad) => (
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
        Toggle steps to build a beat, tap the loop pads to layer in a bassline, chords, and a lead — then hit play.
      </p>
    </div>
  );
}
