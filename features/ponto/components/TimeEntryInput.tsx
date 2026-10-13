import React from "react";

export interface TimeEntry {
  time: string;
  location: string;
}

interface TimeEntryInputProps {
  label: string;
  value: TimeEntry;
  onChange: (value: TimeEntry) => void;
  icone?: React.ReactNode;
}

/** Horário de uma marcação no pedido de ajuste. */
export const TimeEntryInput: React.FC<TimeEntryInputProps> = ({ label, value, onChange, icone }) => {
  const id = `ajuste-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold">
        <span className="text-muted">{icone}</span>
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value.time}
        onChange={(e) => onChange({ ...value, time: e.target.value })}
        className="h-11 w-full rounded-[10px] border border-line-strong bg-white px-3 font-mono text-[15px] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft"
      />
    </div>
  );
};
