// app/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NSW_CURRICULUM, OutcomeCurriculum } from '@/data/curriculum';

interface StageMeta {
  id: string;
  label: string;
  subhead: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  pillActive: string;
}

const STAGE_CONFIG: Record<string, StageMeta> = {
  'early-stage-1': {
    id: 'early-stage-1',
    label: 'Early Stage 1 (Kindergarten)',
    subhead: 'Subitising, counting, and five-frame quantity recognition.',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    borderColor: 'border-rose-200',
    pillActive: 'bg-rose-600 text-white',
  },
  'stage-1': {
    id: 'stage-1',
    label: 'Stage 1 (Years 1–2)',
    subhead: 'Additive relations, bridging to 10, doubles, and ten-frame models.',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    borderColor: 'border-sky-200',
    pillActive: 'bg-sky-600 text-white',
  },
  'stage-2': {
    id: 'stage-2',
    label: 'Stage 2 (Years 3–4)',
    subhead: 'Multiplicative relations, array models, partitioning, and open number lines.',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    pillActive: 'bg-indigo-600 text-white',
  },
  'stage-3': {
    id: 'stage-3',
    label: 'Stage 3 (Years 5–6)',
    subhead: 'Fractions, decimals, percentages, and visual equivalence strips.',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    borderColor: 'border-violet-200',
    pillActive: 'bg-violet-600 text-white',
  },
};

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const allOutcomes = Object.values(NSW_CURRICULUM);

  // Group outcomes by stage
  const groupedOutcomes = Object.keys(STAGE_CONFIG).reduce<Record<string, OutcomeCurriculum[]>>(
    (acc, stageId) => {
      acc[stageId] = allOutcomes.filter((item) => item.stage.toLowerCase() === stageId);
      return acc;
    },
    {}
  );

  const displayedStages =
    selectedFilter === 'all'
      ? Object.keys(STAGE_CONFIG)
      : Object.keys(STAGE_CONFIG).filter((stageId) => stageId === selectedFilter);

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full">
        {/* Hub Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 text-center">
          <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100">
            NSW Mathematics K–6 Syllabus
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Interactive Consolidation Hub
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            Interactive, curriculum-aligned visual manipulatives designed for classroom instruction, iPad small-group work, and independent practice.
          </p>

          {/* Quick Filter Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stages ({allOutcomes.length})
            </button>
            {Object.values(STAGE_CONFIG).map((cfg) => {
              const count = groupedOutcomes[cfg.id]?.length || 0;
              return (
                <button
                  key={cfg.id}
                  onClick={() => setSelectedFilter(cfg.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === cfg.id
                      ? cfg.pillActive
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cfg.id === 'early-stage-1' ? 'ES1' : cfg.label.split(' ')[0] + ' ' + cfg.label.split(' ')[1]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grouped Stage Sections */}
        <div className="space-y-8">
          {displayedStages.map((stageId) => {
            const config = STAGE_CONFIG[stageId];
            const outcomes = groupedOutcomes[stageId] || [];

            if (outcomes.length === 0) return null;

            return (
              <section key={stageId} className="space-y-3">
                <div className="px-2">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-black text-slate-900">{config.label}</h2>
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                    >
                      {outcomes.length} {outcomes.length === 1 ? 'Outcome' : 'Outcomes'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{config.subhead}</p>
                </div>

                <div className="grid gap-3">
                  {outcomes.map((item) => (
                    <Link
                      key={item.outcomeCode}
                      href={`/${item.stage}/${item.outcomeCode}`}
                      className="block p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                          {item.outcomeCode}
                        </span>
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeBg} ${config.badgeText}`}
                        >
                          {item.manipulativeType.replace('-', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        <span>
                          {item.strand} • {item.focusArea}
                        </span>
                        <span className="font-semibold text-slate-400 group-hover:text-slate-700 transition flex items-center gap-1">
                          Launch <span className="text-sm">→</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}