import Link from 'next/link';
import type { SleepEntry } from '@/lib/types';
import { formatDate, formatTime, calcMinutesBetween } from '@/lib/utils';

interface EntryCardProps {
  entry: SleepEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const delta = calcMinutesBetween(
    entry.lights_out_time.slice(0, 5),
    entry.fell_asleep_time.slice(0, 5)
  );

  return (
    <Link
      href={`/log?date=${entry.date}`}
      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text">{formatDate(entry.date)}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            entry.had_nap
              ? 'bg-nap-yes/10 text-nap-yes'
              : 'bg-nap-no/10 text-nap-no'
          }`}
        >
          {entry.had_nap ? 'Nap' : 'No nap'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-text-muted">Lights out</span>
          <p className="font-medium text-text">{formatTime(entry.lights_out_time.slice(0, 5))}</p>
        </div>
        <div>
          <span className="text-text-muted">Asleep in</span>
          <p className={`font-medium ${delta > 30 ? 'text-warning' : 'text-success'}`}>
            {delta} min
          </p>
        </div>
        <div>
          <span className="text-text-muted">Wakings</span>
          <p className="font-medium text-text">{entry.night_wakings}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        <span className="text-text-muted">Wake: </span>
        <span className="font-medium text-text">{formatTime(entry.morning_wake_time.slice(0, 5))}</span>
      </div>
    </Link>
  );
}
