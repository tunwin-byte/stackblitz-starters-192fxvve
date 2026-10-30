// app/[stage]/[outcome]/FiveFrameRunner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { OutcomeCurriculum, FiveFrameQuestion } from '@/data/curriculum';

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

  const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#34d399', '#a855f7'];
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

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.15;
    utter.lang = 'en-AU';
    window.speechSynthesis.speak(utter);
  }
}

export default function FiveFrameRunner({ curriculum }: { curriculum: OutcomeCurriculum }) {
  const [qIndex, setQIndex] = useState(0);
  const q = curriculum.questions[qIndex] as FiveFrameQuestion;

  const [frameSlots, setFrameSlots] = useState<boolean[]>(Array(5).fill(false));
  const [flashVisible, setFlashVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  // Setup per question
  useEffect(() => {
    setStatus('idle');
    setHint(null);
    setSelectedAnswer(null);

    if (q.flashMode) {
      // Pre-fill target number of counters for subitising flash
      const initial = Array(5).fill(false);
      for (let i = 0; i < q.targetCount; i++) initial[i] = true;
      setFrameSlots(initial);
      setFlashVisible(true);
      speak('Look quickly! How many dots do you see?');

      const timer = setTimeout(() => {
        setFlashVisible(false);
      }, 1600); // 1.6s flash
      return () => clearTimeout(timer);
    } else {
      setFrameSlots(Array(5).fill(false));
      setFlashVisible(true);
      speak(q.title);
    }
  }, [qIndex, q]);

  const toggleSlot = (idx: number) => {
    if (q.flashMode || status === 'correct') return;
    sounds.playPop();
    setFrameSlots((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    if (status === 'incorrect') setStatus('idle');
  };

  const currentCount = frameSlots.filter(Boolean).length;

  const handleCheck = (answerToCheck?: number) => {
    const val = answerToCheck !== undefined ? answerToCheck : selectedAnswer;

    if (q.flashMode) {
      if (val === null) {
        setStatus('incorrect');
        setHint('Tap one of the numbers below!');
        sounds.playBuzz();
        return;
      }
      if (val !== q.correctAnswer) {
        setStatus('incorrect');
        setHint(q.hint);
        sounds.playBuzz();
        speak(q.hint);
        return;
      }
    } else {
      // Build mode: verify the five-frame count directly
      if (currentCount !== q.targetCount) {
        setStatus('incorrect');
        setHint(`You have ${currentCount} dots. Tap the boxes to make exactly ${q.targetCount}!`);
        sounds.playBuzz();
        speak(`Make ${q.targetCount}. Right now you have ${currentCount}.`);
        return;
      }
    }

    // Success
    setStatus('correct');
    setHint(null);
    sounds.playFanfare();
    triggerConfetti();
    speak(`Super work! That is ${q.correctAnswer}!`);
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
        <div className="text-6xl mb-3">⭐</div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase">
          Outcome Completed
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">{curriculum.outcomeCode} Superstar!</h2>
        <p className="text-slate-600 text-sm mt-1">You mastered subitising and five-frame counting!</p>
        <button
          onClick={() => {
            setQIndex(0);
            setFinished(false);
          }}
          className="mt-6 w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow transition"
        >
          Play Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none font-sans">
      {/* Five-Frame Visual Box */}
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-rose-800">
            {q.flashMode ? '⚡ Subitise (Fast Eyes)' : '🖐️ Five-Frame Builder'}
          </span>
          {q.flashMode ? (
            <button
              onClick={() => {
                setFlashVisible(true);
                setTimeout(() => setFlashVisible(false), 1600);
              }}
              className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition"
            >
              Peek Again 👁️
            </button>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg">
              {currentCount} / 5
            </span>
          )}
        </div>

        {/* 1x5 Horizontal Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 bg-amber-50/70 border-2 border-amber-300 rounded-2xl w-full">
          {frameSlots.map((isFilled, idx) => (
            <button
              key={idx}
              onClick={() => toggleSlot(idx)}
              className="aspect-square rounded-2xl border-2 border-dashed border-amber-300 bg-white/90 flex items-center justify-center p-1.5 transition active:scale-95 shadow-inner"
            >
              {isFilled && flashVisible && (
                <div className="w-full h-full rounded-full bg-rose-500 border-2 border-rose-600 shadow-md flex items-center justify-center transform animate-fadeIn">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/60" />
                </div>
              )}
            </button>
          ))}
        </div>

        {q.flashMode && !flashVisible && (
          <p className="text-xs font-bold text-slate-400 mt-3">Dots are hidden! How many did you see?</p>
        )}
      </div>

      {/* Answer Form & Number Selection Buttons */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {q.title}
        </label>

        {q.flashMode ? (
          /* Kindergarten-friendly touch numbers 1 to 5 */
          <div className="grid grid-cols-5 gap-2 my-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setSelectedAnswer(num);
                  handleCheck(num);
                }}
                disabled={status === 'correct'}
                className={`py-3.5 rounded-2xl font-black text-xl border-2 transition active:scale-95 ${
                  selectedAnswer === num
                    ? status === 'correct'
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'bg-rose-500 border-rose-600 text-white'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        ) : (
          /* Build Mode: Check button */
          <div className="flex gap-3">
            {status !== 'correct' ? (
              <button
                onClick={() => handleCheck()}
                className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
              >
                I Made It! Check Answer
              </button>
            ) : null}
          </div>
        )}

        {status === 'correct' && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition active:scale-95 text-base"
          >
            {qIndex + 1 === curriculum.questions.length ? 'Finish Activity 🏆' : 'Next Question →'}
          </button>
        )}

        {/* Dynamic Status Banners */}
        {status === 'correct' && (
          <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span>Great job! You got it right!</span>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex items-center gap-2">
            <span className="text-xl">❌</span>
            <div>
              <span className="font-bold block">Try again!</span>
              {hint && <span className="text-xs text-rose-700 font-medium">{hint}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}