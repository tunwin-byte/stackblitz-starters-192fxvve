'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OutcomeCurriculum, TenFrameQuestion } from '@/data/curriculum';

// ==========================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playPop() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playBuzz() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playChime() {
    const ctx = this.initCtx();
    if (!ctx) return;
    [523.25, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playFanfare() {
    const ctx = this.initCtx();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }
}

const sounds = new SoundSynth();

// ==========================================
// 2. CANVAS CONFETTI (Zero External Packages)
// ==========================================
function triggerCanvasConfetti() {
  if (typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'];
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.6,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.7) * 16,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
  }));

  let frame = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });

    frame++;
    if (alive && frame < 90) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

// ==========================================
// 3. TEXT-TO-SPEECH (en-AU narration)
// ==========================================
function speakInstruction(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.1;
    utter.lang = 'en-AU';
    window.speechSynthesis.speak(utter);
  }
}

interface Counter {
  id: string;
  source: 'base' | 'tray';
}

// ==========================================
// 4. ACTIVITY RUNNER COMPONENT
// ==========================================
export default function ActivityRunner({ curriculum }: { curriculum: OutcomeCurriculum }) {
  const [qIndex, setQIndex] = useState(0);
  const q = curriculum.questions[qIndex] as TenFrameQuestion;

  const [frame1, setFrame1] = useState<(Counter | null)[]>([]);
  const [frame2, setFrame2] = useState<(Counter | null)[]>([]);
  const [tray, setTray] = useState<Counter[]>([]);

  const [dragged, setDragged] = useState<{
    counter: Counter;
    origin: 'tray' | { frame: 1 | 2; index: number };
  } | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const frame1Ref = useRef<HTMLDivElement>(null);
  const frame2Ref = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const [answerInput, setAnswerInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const f1: (Counter | null)[] = Array(10).fill(null);
    for (let i = 0; i < Math.min(q.initialBase, 10); i++) {
      f1[i] = { id: `base-${i}`, source: 'base' };
    }
    setFrame1(f1);
    setFrame2(Array(10).fill(null));
    setTray(
      Array.from({ length: q.toAdd }, (_, i) => ({
        id: `tray-${i}-${Date.now()}`,
        source: 'tray',
      }))
    );
    setAnswerInput('');
    setHint(null);
    setStatus('idle');

    speakInstruction(`Start with ${q.initialBase} blue counters. Move ${q.toAdd} yellow counters into the frames!`);
  }, [qIndex, q]);

  const handlePointerDown = (
    e: React.PointerEvent,
    counter: Counter,
    origin: 'tray' | { frame: 1 | 2; index: number }
  ) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragged({ counter, origin });
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragged) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragged) return;

    const x = e.clientX;
    const y = e.clientY;

    const inside = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const inF1 = inside(frame1Ref);
    const inF2 = inside(frame2Ref);
    const inTray = inside(trayRef);

    const removeSource = () => {
      if (dragged.origin === 'tray') {
        setTray((prev) => prev.filter((c) => c.id !== dragged.counter.id));
      } else if (dragged.origin.frame === 1) {
        setFrame1((prev) => {
          const next = [...prev];
          next[(dragged.origin as { frame: 1; index: number }).index] = null;
          return next;
        });
      } else if (dragged.origin.frame === 2) {
        setFrame2((prev) => {
          const next = [...prev];
          next[(dragged.origin as { frame: 2; index: number }).index] = null;
          return next;
        });
      }
    };

    if (inF1) {
      const idx = frame1.findIndex((slot) => slot === null);
      if (idx !== -1) {
        removeSource();
        setFrame1((prev) => {
          const next = [...prev];
          next[idx] = dragged.counter;
          if (next.filter(Boolean).length === 10) {
            sounds.playChime();
          } else {
            sounds.playPop();
          }
          return next;
        });
      }
    } else if (inF2) {
      const idx = frame2.findIndex((slot) => slot === null);
      if (idx !== -1) {
        removeSource();
        setFrame2((prev) => {
          const next = [...prev];
          next[idx] = dragged.counter;
          sounds.playPop();
          return next;
        });
      }
    } else if (inTray && dragged.origin !== 'tray') {
      removeSource();
      setTray((prev) => [...prev, dragged.counter]);
      sounds.playPop();
    }

    setDragged(null);
  };

  const handleCheck = () => {
    const f1Count = frame1.filter(Boolean).length;
    const f2Count = frame2.filter(Boolean).length;
    const userNum = parseInt(answerInput.trim(), 10);

    if (isNaN(userNum)) {
      setStatus('incorrect');
      setHint('Type your number answer in the box first.');
      sounds.playBuzz();
      return;
    }

    if (tray.length > 0) {
      setStatus('incorrect');
      setHint(`Place all ${tray.length} counters from the tray into the frames first.`);
      sounds.playBuzz();
      speakInstruction('Move all counters out of the tray into the frames.');
      return;
    }

    if (f1Count < 10 && f2Count > 0) {
      setStatus('incorrect');
      setHint(q.hintBridge);
      sounds.playBuzz();
      speakInstruction(q.hintBridge);
      return;
    }

    if (userNum !== q.correctAnswer) {
      setStatus('incorrect');
      setHint(`Not quite! The top frame has 10, and the bottom frame has ${f2Count}. Try counting again.`);
      sounds.playBuzz();
      speakInstruction(`Count on from ten. Ten plus ${f2Count} equals what?`);
      return;
    }

    // SUCCESS
    setStatus('correct');
    setHint(null);
    sounds.playFanfare();
    triggerCanvasConfetti();
    speakInstruction(`Brilliant! ${q.initialBase} plus ${q.toAdd} equals ${q.correctAnswer}!`);
  };

  const handleNext = () => {
    if (qIndex + 1 < curriculum.questions.length) {
      setQIndex((prev) => prev + 1);
    } else {
      setFinished(true);
      sounds.playFanfare();
      triggerCanvasConfetti();
    }
  };

  const renderSlots = (
    slots: (Counter | null)[],
    frameNum: 1 | 2,
    ref: React.RefObject<HTMLDivElement | null>
  ) => (
    <div
      ref={ref}
      className="grid grid-cols-5 grid-rows-2 gap-2 p-3 bg-amber-50/80 rounded-2xl border-2 border-amber-300"
      style={{ touchAction: 'none' }}
    >
      {slots.map((slot, i) => (
        <div
          key={i}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-amber-200 bg-white/80 flex items-center justify-center shadow-inner"
        >
          {slot && (
            <div
              onPointerDown={(e) => handlePointerDown(e, slot, { frame: frameNum, index: i })}
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full cursor-grab active:cursor-grabbing shadow-md flex items-center justify-center transition-transform hover:scale-105 ${
                slot.source === 'base'
                  ? 'bg-sky-500 border-2 border-sky-600'
                  : 'bg-amber-400 border-2 border-amber-500'
              }`}
            >
              <div className="w-6 h-6 rounded-full border border-white/40 opacity-75" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (finished) {
    return (
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-200">
        <div className="text-5xl mb-3">🏆</div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
          Outcome Completed
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">{curriculum.outcomeCode} Mastered!</h2>
        <p className="text-slate-600 text-sm mt-1">You solved all questions for {curriculum.title}.</p>
        <button
          onClick={() => {
            setQIndex(0);
            setFinished(false);
          }}
          className="mt-6 w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition"
        >
          Practice Again ↺
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-xl flex flex-col items-center select-none font-sans"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Frame */}
      <div className="w-full mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Top Frame (Fill 10 First)
          </span>
          <span className="text-xs font-bold text-slate-500">
            {frame1.filter(Boolean).length} / 10
          </span>
        </div>
        {renderSlots(frame1, 1, frame1Ref)}
      </div>

      {/* Bottom Frame */}
      <div className="w-full mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Bottom Frame
          </span>
          <span className="text-xs font-bold text-slate-500">
            {frame2.filter(Boolean).length} / 10
          </span>
        </div>
        {renderSlots(frame2, 2, frame2Ref)}
      </div>

      {/* Supply Tray */}
      <div className="w-full mb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-900 block mb-1">
          Counters Tray (Drag into frames)
        </span>
        <div
          ref={trayRef}
          className="min-h-[72px] p-3 bg-white rounded-2xl border-2 border-dashed border-sky-300 flex flex-wrap gap-2.5 items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          {tray.map((counter) => (
            <div
              key={counter.id}
              onPointerDown={(e) => handlePointerDown(e, counter, 'tray')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-400 border-2 border-amber-500 shadow cursor-grab active:cursor-grabbing hover:scale-105 transition-transform flex items-center justify-center"
            >
              <div className="w-6 h-6 rounded-full border border-white/50" />
            </div>
          ))}
          {tray.length === 0 && (
            <span className="text-xs font-semibold text-emerald-600">All counters placed! ⭐</span>
          )}
        </div>
      </div>

      {/* Interactive Answer Box & Feedback Alerts */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Total: {q.initialBase} + {q.toAdd} = ?
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value);
              if (status === 'incorrect') setStatus('idle');
            }}
            disabled={status === 'correct'}
            placeholder="?"
            className={`w-24 text-center text-2xl font-black p-3 rounded-xl border-2 transition focus:outline-none ${
              status === 'correct'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : status === 'incorrect'
                ? 'bg-rose-50 border-rose-500 text-rose-900'
                : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
            }`}
          />

          {status !== 'correct' ? (
            <button
              onClick={handleCheck}
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
            >
              {qIndex + 1 === curriculum.questions.length ? 'Finish Activity 🏆' : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Dynamic Status Banners */}
        {status === 'correct' && (
          <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <span className="text-xl">🎉</span>
            <span>Correct! Great work bridging to 10.</span>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex items-center gap-2 animate-shake">
            <span className="text-xl">❌</span>
            <div>
              <span className="font-bold block">Incorrect, try again!</span>
              {hint && <span className="text-xs text-rose-700 font-medium">{hint}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Floating Drag Avatar */}
      {dragged && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${dragPos.x}px`, top: `${dragPos.y}px` }}
        >
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-2xl opacity-90 scale-110 flex items-center justify-center ${
              dragged.counter.source === 'base'
                ? 'bg-sky-500 border-2 border-sky-600'
                : 'bg-amber-400 border-2 border-amber-500'
            }`}
          >
            <div className="w-6 h-6 rounded-full border border-white/50" />
          </div>
        </div>
      )}
    </div>
  );
}