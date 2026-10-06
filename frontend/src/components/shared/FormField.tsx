import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-purple-400/60 focus:bg-white/[0.06]';

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="flex items-baseline gap-1.5">
        <span className="text-xs font-semibold text-white/70">{label}</span>
        {required && <span className="text-[10px] text-purple-300">required</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'url' | 'date' | 'datetime-local';
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(CONTROL, className)}
    />
  );
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(CONTROL, 'resize-y leading-relaxed', className)}
    />
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(CONTROL, 'appearance-none', className)}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-[#0b0b0e]"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
