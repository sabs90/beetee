'use client';

import { useState, useEffect } from 'react';
import { NapVsSleepChart } from '@/components/charts/NapVsSleepChart';
import { SleepTrendChart } from '@/components/charts/SleepTrendChart';
import type { SleepEntry } from '@/lib/types';
import { calcMinutesBetween } from '@/lib/utils';

export default function PatternsPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/entries?limit=60')
      .then((r) => r.json())
      .then((data: SleepEntry[]) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-text-muted">Loading...</p>;
  }

  const napDays = entries.filter((e) => e.had_nap);
  const noNapDays = entries.filter((e) => !e.had_nap);

  function avgDelta(items: SleepEntry[]) {
    if (items.length === 0) return '—';
    const total = items.reduce(
      (sum, e) =>
        sum + calcMinutesBetween(e.lights_out_time.slice(0, 5), e.fell_asleep_time.slice(0, 5)),
      0
    );
    return `${Math.round(total / items.length)} min`;
  }

  function avgWakings(items: SleepEntry[]) {
    if (items.length === 0) return '—';
    return (items.reduce((sum, e) => sum + e.night_wakings, 0) / items.length).toFixed(1);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text">Patterns</h1>

      {entries.length === 0 ? (
        <p className="text-center text-text-muted">
          Log a few nights to start seeing patterns.
        </p>
      ) : (
        <>
          {/* Summary stats */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Avg. to sleep (nap)</p>
              <p className="text-xl font-bold text-nap-yes">{avgDelta(napDays)}</p>
              <p className="text-xs text-text-muted">{napDays.length} nights</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Avg. to sleep (no nap)</p>
              <p className="text-xl font-bold text-nap-no">{avgDelta(noNapDays)}</p>
              <p className="text-xs text-text-muted">{noNapDays.length} nights</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Avg. wakings</p>
              <p className="text-xl font-bold text-text">{avgWakings(entries)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Total nights</p>
              <p className="text-xl font-bold text-text">{entries.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="flex flex-col gap-8">
            <NapVsSleepChart entries={entries} />
            <SleepTrendChart entries={entries} />
          </div>
        </>
      )}
    </div>
  );
}
