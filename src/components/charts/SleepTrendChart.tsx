'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';
import type { SleepEntry } from '@/lib/types';
import { calcMinutesBetween } from '@/lib/utils';

interface Props {
  entries: SleepEntry[];
}

function timeToDecimal(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  // Shift times after midnight so 00:30 = 24.5, keeping chart continuous
  return h < 6 ? h + 24 + m / 60 : h + m / 60;
}

function decimalToTime(val: number): string {
  const h = Math.floor(val % 24);
  const m = Math.round((val % 1) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

interface ChartDot {
  cx: number;
  cy: number;
  payload: { hadNap: boolean };
}

function NapDot(props: ChartDot) {
  const { cx, cy, payload } = props;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={payload.hadNap ? '#F59E0B' : '#6366F1'}
      stroke="white"
      strokeWidth={1.5}
    />
  );
}

export function SleepTrendChart({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-center text-sm text-text-muted">Not enough data yet</p>;
  }

  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date.slice(8) + '/' + e.date.slice(5, 7), // DD/MM
      lightsOut: timeToDecimal(e.lights_out_time),
      fellAsleep: timeToDecimal(e.fell_asleep_time),
      delta: calcMinutesBetween(e.lights_out_time.slice(0, 5), e.fell_asleep_time.slice(0, 5)),
      hadNap: e.had_nap,
    }));

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-text">Sleep timing trend</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E2F0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            tickFormatter={decimalToTime}
            tick={{ fontSize: 11 }}
            reversed
          />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: unknown, name: unknown) => {
              const v = value as number;
              if (name === 'delta') return [`${v} min`, 'Time to sleep'];
              return [decimalToTime(v), name === 'lightsOut' ? 'Lights out' : 'Fell asleep'];
            }}
          />
          <Line
            type="monotone"
            dataKey="lightsOut"
            stroke="#6366F1"
            strokeWidth={2}
            dot={<NapDot cx={0} cy={0} payload={{ hadNap: false }} />}
            name="lightsOut"
          />
          <Line
            type="monotone"
            dataKey="fellAsleep"
            stroke="#A78BFA"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={<NapDot cx={0} cy={0} payload={{ hadNap: false }} />}
            name="fellAsleep"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-primary-light" /> Lights out
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-accent-light" /> Fell asleep
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-nap-yes" /> Nap day
        </span>
      </div>
    </div>
  );
}
