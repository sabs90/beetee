export interface SleepEntry {
  id: string;
  date: string;
  had_nap: boolean;
  nap_duration_mins: number | null;
  nap_wake_time: string | null;
  lights_out_time: string;
  fell_asleep_time: string;
  night_wakings: number;
  morning_wake_time: string;
  notes: string | null;
  created_at: string;
}

export type SleepEntryInput = Omit<SleepEntry, 'id' | 'created_at'>;
