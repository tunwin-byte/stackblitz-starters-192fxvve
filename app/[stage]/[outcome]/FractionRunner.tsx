// app/[stage]/[outcome]/FractionRunner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { OutcomeCurriculum, FractionQuestion } from '@/data/curriculum';

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

  playClick() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  playBuzz() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
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

function triggerConfetti() {
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

  const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.55,
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
    if (alive && frame < 90) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

const DENOMINATOR_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

export default function FractionRunner({ curriculum }: { curriculum: OutcomeCurriculum }) {
  const [qIndex, setQIndex] = useState(0);
  const q = curriculum.questions[qIndex] as FractionQuestion;

  const [denominator, setDenominator] = useState(q.targetDenominator);
  const [shadedCount, setShadedCount] = useState(1);
  const [percentInput, setPercentInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setDenominator(q.targetDenominator);
    setShadedCount(1);
    setPercentInput('');
    setStatus('idle');
    setHint(null);
  }, [qIndex, q]);

  const currentPercent = (shadedCount / denominator) * 100;
  const currentDecimal = (shadedCount / denominator).toFixed(3);

  const handleCheck = () => {
    const userVal = parseFloat(percentInput.trim());

    if (isNaN(userVal)) {
      setStatus('incorrect');
      setHint('Enter a percentage in the box before checking.');
      sounds.playBuzz();
      return;
    }

    // Verify fraction model matches question
    if (shadedCount !== q.targetNumerator || denominator !== q.targetDenominator) {
      setStatus('incorrect');
      setHint(
        `First set the bar partitions to ${q.targetDenominator} and shade exactly ${q.targetNumerator} parts to model ${q.targetFraction}.`
      );
      sounds.playBuzz();
      return;
    }

    // Verify percentage
    if (Math.abs(userVal - q.percentageEquivalent) > 0.1) {
      setStatus('incorrect');
      setHint(q.hint);
      sounds.playBuzz();
      return;
    }

    // Correct!
    setStatus('correct');
    setHint(null);
    sounds.playFanfare();
    triggerConfetti();
  };

  const handleNext = () => {
    if (qIndex + 1 < curriculum.questions.length) {
      setQIndex((prev) => prev + 1);
    } else {
      setFinished(true);
      sounds.playFanfare();
      triggerConfetti();
    }
  };

  if (finished) {
    return (
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-200 font-sans">
        <div className="text-5xl mb-3">🎓</div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
          Outcome Completed
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">{curriculum.outcomeCode} Mastered!</h2>
        <p className="text-slate-600 text-sm mt-1">
          You mastered fraction, decimal, and percentage conversions.
        </p>
        <button
          onClick={() => {
            setQIndex(0);
            setFinished(false);
          }}
          className="mt-6 w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow transition"
        >
          Practice Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none font-sans">
      {/* Interactive Fraction Bar Model */}
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Interactive Fraction Strip
          </span>
          <span className="text-xs font-bold px-2.5 py-1 bg-violet-100 text-violet-800 rounded-lg">
            {shadedCount} / {denominator} ({currentPercent.toFixed(1)}%)
          </span>
        </div>

        {/* The Bar */}
        <div className="h-16 w-full bg-slate-100 rounded-2xl border-2 border-slate-300 flex overflow-hidden shadow-inner mb-4">
          {Array.from({ length: denominator }).map((_, i) => {
            const isShaded = i < shadedCount;
            return (
              <button
                key={i}
                onClick={() => {
                  setShadedCount(i + 1);
                  sounds.playClick();
                }}
                className={`flex-1 h-full border-r last:border-r-0 border-slate-300 flex items-center justify-center font-bold text-xs transition-colors ${
                  isShaded
                    ? 'bg-violet-500 hover:bg-violet-600 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-400'
                }`}
              >
                1/{denominator}
              </button>
            );
          })}
        </div>

        {/* Partition Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase">
            Choose Denominator (Partitions):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DENOMINATOR_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDenominator(d);
                  setShadedCount(1);
                  sounds.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  denominator === d
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                /{d}
              </button>
            ))}
          </div>
        </div>

        {/* Live Equivalence Tracker */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Fraction</span>
            <span className="text-base font-black text-slate-800">
              {shadedCount}/{denominator}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Decimal</span>
            <span className="text-base font-black text-slate-800">{currentDecimal}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Percentage</span>
            <span className="text-base font-black text-slate-800">{currentPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Answer Verification Form */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {q.title}
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Model <strong>{q.targetFraction}</strong> on the bar above, then enter the equivalent percentage:
        </p>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={percentInput}
              onChange={(e) => {
                setPercentInput(e.target.value);
                if (status === 'incorrect') setStatus('idle');
              }}
              disabled={status === 'correct'}
              placeholder="75"
              className={`w-32 text-center text-2xl font-black p-3 pr-8 rounded-xl border-2 transition focus:outline-none ${
                status === 'correct'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : status === 'incorrect'
                  ? 'bg-rose-50 border-rose-500 text-rose-900'
                  : 'bg-slate-50 border-slate-300 focus:border-violet-500 text-slate-900'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
          </div>

          {status !== 'correct' ? (
            <button
              onClick={handleCheck}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
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
          <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span>Correct! Outstanding equivalence work.</span>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex items-center gap-2">
            <span className="text-xl">❌</span>
            <div>
              <span className="font-bold block">Incorrect, try again!</span>
              {hint && <span className="text-xs text-rose-700 font-medium">{hint}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}