// app/[stage]/[outcome]/NumberLineRunner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { OutcomeCurriculum, NumberLineQuestion } from '@/data/curriculum';

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

  playJump(isTen: boolean) {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isTen ? 'triangle' : 'sine';
    const freq = isTen ? 580 : 720;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
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

  const colors = ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
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

interface Jump {
  amount: number;
  from: number;
  to: number;
}

export default function NumberLineRunner({ curriculum }: { curriculum: OutcomeCurriculum }) {
  const [qIndex, setQIndex] = useState(0);
  const q = curriculum.questions[qIndex] as NumberLineQuestion;

  const [jumps, setJumps] = useState<Jump[]>([]);
  const [currentVal, setCurrentVal] = useState(q.startNumber);
  const [answerInput, setAnswerInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setCurrentVal(q.startNumber);
    setJumps([]);
    setAnswerInput('');
    setStatus('idle');
    setHint(null);
  }, [qIndex, q]);

  const addJump = (amount: number) => {
    sounds.playJump(Math.abs(amount) >= 10);
    const nextVal = currentVal + amount;
    setJumps((prev) => [...prev, { amount, from: currentVal, to: nextVal }]);
    setCurrentVal(nextVal);
    if (status === 'incorrect') setStatus('idle');
  };

  const undoJump = () => {
    if (jumps.length === 0) return;
    const last = jumps[jumps.length - 1];
    setJumps((prev) => prev.slice(0, -1));
    setCurrentVal(last.from);
  };

  const resetJumps = () => {
    setJumps([]);
    setCurrentVal(q.startNumber);
  };

  const totalJumped = jumps.reduce((sum, j) => sum + j.amount, 0);

  const handleCheck = () => {
    const userVal = parseInt(answerInput.trim(), 10);

    if (isNaN(userVal)) {
      setStatus('incorrect');
      setHint('Type a number in the box before checking.');
      sounds.playBuzz();
      return;
    }

    if (totalJumped !== q.toAdd) {
      setStatus('incorrect');
      setHint(
        `You need to add ${q.toAdd}. Right now, your jumps total +${totalJumped}. Adjust your jumps!`
      );
      sounds.playBuzz();
      return;
    }

    if (userVal !== q.correctAnswer) {
      setStatus('incorrect');
      setHint(q.hint);
      sounds.playBuzz();
      return;
    }

    // Success
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
        <div className="text-5xl mb-3">🏅</div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
          Outcome Completed
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">{curriculum.outcomeCode} Mastered!</h2>
        <p className="text-slate-600 text-sm mt-1">
          You mastered mental addition using the empty number line jump strategy.
        </p>
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
    <div className="w-full max-w-xl flex flex-col items-center select-none font-sans">
      {/* Number Line Canvas */}
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Empty Number Line (Jump Strategy)
          </span>
          <span className="text-xs font-bold px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg">
            Added: +{totalJumped} / {q.toAdd}
          </span>
        </div>

        {/* Visual Line & Hops Display */}
        <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center overflow-x-auto">
          {/* Hops chain */}
          <div className="min-w-full flex items-center justify-start gap-1 py-4 px-2">
            {/* Start Node */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Start</span>
              <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center shadow">
                {q.startNumber}
              </div>
            </div>

            {/* Jump segments */}
            {jumps.map((j, idx) => (
              <div key={idx} className="flex items-center">
                {/* Arc representation */}
                <div className="flex flex-col items-center px-1">
                  <span
                    className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      Math.abs(j.amount) >= 10
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {j.amount > 0 ? `+${j.amount}` : j.amount}
                  </span>
                  <div
                    className={`h-1.5 rounded-full my-1 transition-all ${
                      Math.abs(j.amount) >= 10 ? 'w-16 bg-indigo-500' : 'w-10 bg-amber-400'
                    }`}
                  />
                </div>

                {/* Landing Node */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                  <div
                    className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shadow-sm ${
                      idx === jumps.length - 1
                        ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {j.to}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Landing Point Callout */}
          <div className="mt-2 text-xs font-semibold text-slate-600">
            Currently landed on: <strong className="text-sky-700 text-sm font-black">{currentVal}</strong>
          </div>
        </div>

        {/* Jump Control Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addJump(10)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-sm transition active:scale-95"
            >
              +10
            </button>
            <button
              onClick={() => addJump(5)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs shadow-sm transition active:scale-95"
            >
              +5
            </button>
            <button
              onClick={() => addJump(1)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-sm transition active:scale-95"
            >
              +1
            </button>
            <button
              onClick={() => addJump(-1)}
              className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs transition active:scale-95"
            >
              -1 (Compensate)
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={undoJump}
              disabled={jumps.length === 0}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition disabled:opacity-40"
            >
              Undo ↶
            </button>
            <button
              onClick={resetJumps}
              disabled={jumps.length === 0}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition disabled:opacity-40"
            >
              Reset ↺
            </button>
          </div>
        </div>
      </div>

      {/* Answer Form & Feedback Alerts */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {q.title}: {q.startNumber} + {q.toAdd} = ?
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Make jumps totalling <strong>+{q.toAdd}</strong>, then enter the landing sum:
        </p>

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
            className={`w-28 text-center text-2xl font-black p-3 rounded-xl border-2 transition focus:outline-none ${
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
          <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span>Correct! Excellent jump strategy work.</span>
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