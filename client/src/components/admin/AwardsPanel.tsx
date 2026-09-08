import { useEffect, useState, type FormEvent } from 'react';
import type { Award } from '@portfolio/shared';
import { createAward, deleteAward, getAwards, updateAward } from '@/lib/api';
import { AlertIcon } from '../Icons';
import { Button, StatusMessage } from '../ui';
import { EditorShell, TextAreaField, TextField, optionalNumber, optionalString } from './fields';

export function AwardsPanel() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [editing, setEditing] = useState<Award | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh(): Promise<void> {
    try {
      setAwards(await getAwards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load credentials');
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get('title') ?? '').trim(),
      issuer: String(data.get('issuer') ?? '').trim(),
      year: optionalNumber(data, 'year') ?? new Date().getFullYear(),
      description: optionalString(data, 'description'),
      imageUrl: optionalString(data, 'imageUrl'),
      sortOrder: optionalNumber(data, 'sortOrder') ?? 0,
    };

    try {
      if (editing) {
        await updateAward(editing.id, payload);
      } else {
        await createAward(payload);
      }
      setEditing(null);
      setCreating(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(award: Award): Promise<void> {
    if (!window.confirm(`Delete "${award.title}"? This cannot be undone.`)) return;
    try {
      await deleteAward(award.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const showEditor = creating || editing !== null;

  return (
    <div className="space-y-6">
      {error ? (
        <StatusMessage tone="error">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </StatusMessage>
      ) : null}

      {!showEditor ? (
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          New credential
        </Button>
      ) : null}

      {showEditor ? (
        <EditorShell title={editing ? `Edit: ${editing.title}` : 'New credential'}>
          <form
            key={editing?.id ?? 'new'}
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-4"
          >
            <TextField name="title" label="Title" required defaultValue={editing?.title} />

            <div className="grid gap-4 sm:grid-cols-3">
              <TextField name="issuer" label="Issuer" required defaultValue={editing?.issuer} />
              <TextField
                name="year"
                label="Year"
                type="number"
                required
                defaultValue={editing?.year}
              />
              <TextField
                name="sortOrder"
                label="Sort order"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
              />
            </div>

            <TextField name="imageUrl" label="Image path" defaultValue={editing?.imageUrl} />

            <TextAreaField
              name="description"
              label="Description"
              defaultValue={editing?.description}
              rows={4}
            />

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </EditorShell>
      ) : null}

      <ul className="space-y-2">
        {awards.map((award) => (
          <li
            key={award.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{award.title}</p>
              <p className="truncate text-xs text-muted">
                {award.issuer} · {award.year}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(award);
                  setCreating(false);
                }}
              >
                Edit
              </Button>
              <Button variant="outline" onClick={() => void handleDelete(award)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
