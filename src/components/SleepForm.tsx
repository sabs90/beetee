'use client';

import { useState, useEffect } from 'react';
import { TimeInput } from './TimeInput';
import type { SleepEntry } from '@/lib/types';

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

interface SleepFormProps {
  editDate?: string;
}

export function SleepForm({ editDate }: SleepFormProps) {
  const [date, setDate] = useState(editDate || todayDate());
  const [hadNap, setHadNap] = useState(false);
  const [napDuration, setNapDuration] = useState('');
  const [napWakeTime, setNapWakeTime] = useState('');
  const [lightsOutTime, setLightsOutTime] = useState('20:00');
  const [fellAsleepTime, setFellAsleepTime] = useState('');
  const [nightWakings, setNightWakings] = useState(0);
  const [morningWakeTime, setMorningWakeTime] = useState('06:30');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editDate) {
      fetch(`/api/entries?date=${editDate}`)
        .then((r) => r.json())
        .then((data: SleepEntry[]) => {
          if (data.length > 0) {
            const e = data[0];
            setDate(e.date);
            setHadNap(e.had_nap);
            setNapDuration(e.nap_duration_mins?.toString() || '');
            setNapWakeTime(e.nap_wake_time?.slice(0, 5) || '');
            setLightsOutTime(e.lights_out_time.slice(0, 5));
            setFellAsleepTime(e.fell_asleep_time.slice(0, 5));
            setNightWakings(e.night_wakings);
            setMorningWakeTime(e.morning_wake_time.slice(0, 5));
            setNotes(e.notes || '');
            if (e.notes) setShowNotes(true);
          }
        });
    }
  }, [editDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const body = {
      date,
      had_nap: hadNap,
      nap_duration_mins: hadNap && napDuration ? parseInt(napDuration) : null,
      nap_wake_time: hadNap && napWakeTime ? napWakeTime : null,
      lights_out_time: lightsOutTime,
      fell_asleep_time: fellAsleepTime,
      night_wakings: nightWakings,
      morning_wake_time: morningWakeTime,
      notes: notes || null,
    };

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Date */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
        />
      </label>

      {/* Nap toggle */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">Did she nap today?</span>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setHadNap(val)}
              className={`flex-1 rounded-lg border py-3 text-base font-semibold transition-colors ${
                hadNap === val
                  ? val
                    ? 'border-nap-yes bg-nap-yes/10 text-nap-yes'
                    : 'border-nap-no bg-nap-no/10 text-nap-no'
                  : 'border-border bg-surface text-text-muted'
              }`}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {/* Nap details (conditional) */}
      {hadNap && (
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">Nap length (mins)</span>
            <input
              type="number"
              value={napDuration}
              onChange={(e) => setNapDuration(e.target.value)}
              placeholder="60"
              min={0}
              max={180}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
            />
          </label>
          <TimeInput
            label="Woke from nap"
            value={napWakeTime}
            onChange={setNapWakeTime}
          />
        </div>
      )}

      {/* Lights out */}
      <TimeInput
        label="Lights out"
        value={lightsOutTime}
        onChange={setLightsOutTime}
        required
      />

      {/* Fell asleep */}
      <TimeInput
        label="Fell asleep (estimate)"
        value={fellAsleepTime}
        onChange={setFellAsleepTime}
        required
      />

      {/* Night wakings */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Night wakings</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setNightWakings(Math.max(0, nightWakings - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-lg font-bold text-text-secondary"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-2xl font-bold text-text">
            {nightWakings}
          </span>
          <button
            type="button"
            onClick={() => setNightWakings(nightWakings + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-lg font-bold text-text-secondary"
          >
            +
          </button>
        </div>
      </div>

      {/* Morning wake */}
      <TimeInput
        label="Morning wake time"
        value={morningWakeTime}
        onChange={setMorningWakeTime}
        required
      />

      {/* Notes (collapsed by default) */}
      {!showNotes ? (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-left text-sm font-medium text-primary"
        >
          + Add notes
        </button>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything notable about tonight..."
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
          />
        </label>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-lg bg-primary py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Entry'}
      </button>

      {saved && (
        <p className="text-center text-sm font-medium text-success">Entry saved successfully</p>
      )}
      {error && (
        <p className="text-center text-sm font-medium text-red-600">{error}</p>
      )}
    </form>
  );
}
