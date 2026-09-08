import type { ReactNode } from 'react';

/** Form field primitives shared by the admin editor panels. */

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm transition focus:border-accent focus:outline-none';

export function TextField({
  name,
  label,
  defaultValue,
  required,
  type = 'text',
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ''}
        className={inputClass}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  name,
  label,
  defaultValue,
  rows = 8,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className={`${inputClass} resize-y font-mono text-xs`}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-border accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export function EditorShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}

/** Reads a text input, returning null for an empty value so the API clears the column. */
export function optionalString(data: FormData, key: string): string | null {
  const value = String(data.get(key) ?? '').trim();
  return value === '' ? null : value;
}

export function optionalNumber(data: FormData, key: string): number | null {
  const value = String(data.get(key) ?? '').trim();
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Splits a comma-separated tech list into trimmed, non-empty entries. */
export function parseList(data: FormData, key: string): string[] {
  return String(data.get(key) ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
}
