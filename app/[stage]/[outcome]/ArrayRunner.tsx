'use client';

import React, { useState, useEffect } from 'react';
import { OutcomeCurriculum, ArrayQuestion } from '@/data/curriculum';

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

  playClick() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

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
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);

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

  const colors = ['#6366f1', '#fbbf24', '#34d399', '#f43f5e', '#38bdf8'];
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

// ==========================================
// 4. ARRAY RUNNER COMPONENT
// ==========================================
export default function ArrayRunner({ curriculum }: { curriculum: OutcomeCurriculum }) {
  const [qIndex, setQIndex] = useState(0);
  const q = curriculum.questions[qIndex] as ArrayQuestion;

  const [activeRows, setActiveRows] = useState(q.rows);
  const [activeCols, setActiveCols] = useState(q.cols);
  const [showPartition, setShowPartition] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const maxGrid = 8; // 8x8 interactive canvas

  useEffect(() => {
    setActiveRows(q.rows);
    setActiveCols(q.cols);
    setShowPartition(false);
    setAnswerInput('');
    setHint(null);
    setStatus('idle');

    speakInstruction(`Model ${q.rows} rows of ${q.cols}. What is the total product?`);
  }, [qIndex, q]);

  const handleCheck = () => {
    const userVal = parseInt(answerInput.trim(), 10);

    if (isNaN(userVal)) {
      setStatus('incorrect');
      setHint('Type a number in the box before checking.');
      sounds.playBuzz();
      return;
    }

    if (activeRows !== q.rows || activeCols !== q.cols) {
      setStatus('incorrect');
      setHint(`Adjust the grid to show ${q.rows} rows by ${q.cols} columns first.`);
      sounds.playBuzz();
      speakInstruction(`Tap the grid to set ${q.rows} rows and ${q.cols} columns.`);
      return;
    }

    if (userVal !== q.correctAnswer) {
      setStatus('incorrect');
      setHint(q.hint);
      sounds.playBuzz();
      speakInstruction(`Not quite. ${q.hint}`);
      return;
    }

    // SUCCESS
    setStatus('correct');
    setHint(null);
    sounds.playFanfare();
    triggerCanvasConfetti();
    speakInstruction(`Outstanding! ${q.rows} times ${q.cols} equals ${q.correctAnswer}!`);
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

  // Calculate partitioned values for 5s facts
  const splitCol = Math.min(5, activeCols);
  const part1Count = activeRows * splitCol;
  const part2Count = activeRows * Math.max(0, activeCols - splitCol);

  if (finished) {
    return (
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-200 font-sans">
        <div className="text-5xl mb-3">🌟</div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
          Outcome Completed
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">{curriculum.outcomeCode} Mastered!</h2>
        <p className="text-slate-600 text-sm mt-1">Great job exploring array structures, factors, and partitions.</p>
        <button
          onClick={() => {
            setQIndex(0);
            setFinished(false);
          }}
          className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
        >
          Practice Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none font-sans">
      {/* Grid Canvas */}
      <div className="w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Interactive Array: {activeRows} × {activeCols}
          </span>
          <button
            onClick={() => {
              setShowPartition(!showPartition);
              sounds.playClick();
            }}
            className={`text-xs font-bold px-3 py-1 rounded-lg border transition ${
              showPartition
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {showPartition ? 'Hide Partition' : 'Partition (by 5s)'}
          </button>
        </div>

        {/* 8x8 Grid */}
        <div
          className="grid gap-1.5 p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${maxGrid}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: maxGrid }).map((_, rIdx) =>
            Array.from({ length: maxGrid }).map((_, cIdx) => {
              const inActive = rIdx < activeRows && cIdx < activeCols;
              const isPart2 = showPartition && inActive && cIdx >= 5;

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => {
                    setActiveRows(rIdx + 1);
                    setActiveCols(cIdx + 1);
                    sounds.playClick();
                  }}
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl transition-all flex items-center justify-center font-bold text-xs ${
                    inActive
                      ? isPart2
                        ? 'bg-amber-400 border-2 border-amber-500 shadow-sm text-amber-900 scale-95'
                        : 'bg-indigo-500 border-2 border-indigo-600 shadow-sm text-white scale-95'
                      : 'bg-white border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {inActive && '•'}
                </button>
              );
            })
          )}
        </div>

        {/* Partition Details Banner */}
        {showPartition && activeCols > 5 && (
          <div className="mt-3 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200 font-medium">
            ({activeRows} × 5 = <strong>{part1Count}</strong>) + ({activeRows} × {activeCols - 5} ={' '}
            <strong>{part2Count}</strong>) = <strong>{part1Count + part2Count}</strong>
          </div>
        )}
      </div>

      {/* Answer Form & Feedback Alerts */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {q.title}: {q.rows} × {q.cols} = ?
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
            className={`w-28 text-center text-2xl font-black p-3 rounded-xl border-2 transition focus:outline-none ${
              status === 'correct'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : status === 'incorrect'
                ? 'bg-rose-50 border-rose-500 text-rose-900'
                : 'bg-slate-50 border-slate-300 focus:border-indigo-500 text-slate-900'
            }`}
          />

          {status !== 'correct' ? (
            <button
              onClick={handleCheck}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
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
            <span>Correct! Outstanding calculation.</span>
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