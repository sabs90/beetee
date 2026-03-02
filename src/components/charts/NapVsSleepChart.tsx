'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SleepEntry } from '@/lib/types';
import { calcMinutesBetween } from '@/lib/utils';

interface Props {
  entries: SleepEntry[];
}

export function NapVsSleepChart({ entries }: Props) {
  const napDays = entries.filter((e) => e.had_nap);
  const noNapDays = entries.filter((e) => !e.had_nap);

  function avgDelta(items: SleepEntry[]) {
    if (items.length === 0) return 0;
    const total = items.reduce(
      (sum, e) =>
        sum + calcMinutesBetween(e.lights_out_time.slice(0, 5), e.fell_asleep_time.slice(0, 5)),
      0
    );
    return Math.round(total / items.length);
  }

  const data = [
    { name: 'Nap days', minutes: avgDelta(napDays), count: napDays.length, color: '#F59E0B' },
    { name: 'No nap', minutes: avgDelta(noNapDays), count: noNapDays.length, color: '#6366F1' },
  ];

  if (entries.length === 0) {
    return <p className="text-center text-sm text-text-muted">Not enough data yet</p>;
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-text">Avg. time to fall asleep</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E2F0" />
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis unit=" min" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: unknown) =>
              [`${value} min`, 'Average']
            }
          />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
