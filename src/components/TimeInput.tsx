interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function TimeInput({ label, value, onChange, required }: TimeInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text focus:border-primary-light focus:ring-1 focus:ring-primary-light"
      />
    </label>
  );
}
