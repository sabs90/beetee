'use client';

import { useState, useEffect } from 'react';
import { EntryCard } from '@/components/EntryCard';
import type { SleepEntry } from '@/lib/types';

export default function HistoryPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadEntries(0);
  }, []);

  async function loadEntries(newOffset: number) {
    setLoading(true);
    const res = await fetch(`/api/entries?limit=30&offset=${newOffset}`);
    const data: SleepEntry[] = await res.json();

    if (newOffset === 0) {
      setEntries(data);
    } else {
      setEntries((prev) => [...prev, ...data]);
    }

    setHasMore(data.length === 30);
    setOffset(newOffset);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text">History</h1>

      {entries.length === 0 && !loading && (
        <p className="text-center text-text-muted">No entries yet. Start logging!</p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {hasMore && entries.length > 0 && (
        <button
          onClick={() => loadEntries(offset + 30)}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
