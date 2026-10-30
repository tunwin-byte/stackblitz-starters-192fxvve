// app/[stage]/[outcome]/page.tsx
import Link from 'next/link';
import { NSW_CURRICULUM } from '@/data/curriculum';
import FiveFrameRunner from './FiveFrameRunner';
import ActivityRunner from './ActivityRunner';
import ArrayRunner from './ArrayRunner';
import FractionRunner from './FractionRunner';
import NumberLineRunner from './NumberLineRunner';

interface PageProps {
  params: {
    stage?: string;
    outcome?: string;
  };
}

export default function OutcomePage({ params }: PageProps) {
  const stage = params?.stage || '';
  const outcome = params?.outcome || '';

  const lookupKey = Object.keys(NSW_CURRICULUM).find(
    (k) => k.toLowerCase() === outcome.toLowerCase()
  );

  const data = lookupKey ? NSW_CURRICULUM[lookupKey] : null;

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-red-300 shadow">
          <h2 className="text-lg font-bold text-red-600 mb-2">Outcome Not Found</h2>
          <p className="text-xs text-slate-600 mb-4">
            Could not find outcome: <strong>{outcome}</strong> in stage: <strong>{stage}</strong>
          </p>
          <Link href="/" className="text-xs font-bold text-sky-600 underline">
            ← Back to Hub
          </Link>
        </div>
      </main>
    );
  }

  const stageBadgeColor =
    data.stage === 'early-stage-1'
      ? 'bg-rose-100 text-rose-800'
      : data.stage === 'stage-3'
      ? 'bg-violet-100 text-violet-800'
      : data.stage === 'stage-2'
      ? 'bg-indigo-100 text-indigo-800'
      : 'bg-sky-100 text-sky-800';

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-xs font-bold text-sky-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-sm"
        >
          ← All Outcomes
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
          {data.stage}
        </span>
      </div>

      {/* Syllabus Header */}
      <div className="w-full max-w-xl bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
          <span className="uppercase tracking-wider">{data.stage.replace(/-/g, ' ')}</span>
          <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${stageBadgeColor}`}>
            {data.outcomeCode}
          </span>
        </div>
        <h1 className="text-lg font-black text-slate-900">{data.title}</h1>
        <p className="text-xs text-slate-600">
          {data.strand} • {data.focusArea}
        </p>
      </div>

      {/* Router: Selects manipulative component */}
      {data.manipulativeType === 'five-frame' ? (
        <FiveFrameRunner curriculum={data} />
      ) : data.manipulativeType === 'number-line' ? (
        <NumberLineRunner curriculum={data} />
      ) : data.manipulativeType === 'fraction-bar' ? (
        <FractionRunner curriculum={data} />
      ) : data.manipulativeType === 'array-grid' ? (
        <ArrayRunner curriculum={data} />
      ) : (
        <ActivityRunner curriculum={data} />
      )}
    </main>
  );
}