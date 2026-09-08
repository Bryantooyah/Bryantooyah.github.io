import { useState, type FormEvent } from 'react';
import type { AdminUser } from '@portfolio/shared';
import { ApiError, login } from '@/lib/api';
import { AlertIcon } from '../Icons';
import { Button, StatusMessage } from '../ui';

export function LoginForm({ onSuccess }: { onSuccess: (user: AdminUser) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const data = new FormData(event.currentTarget);

    try {
      const user = await login(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
      onSuccess(user);
    } catch (err) {
      /*
        Distinguish "wrong password" from "the API is not there".

        An ApiError means the server answered and rejected us, so its message is
        the useful one. Anything else is a network failure — a raw "Failed to
        fetch" tells you nothing, and in development the cause is almost always
        that only the client is running.
      */
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          import.meta.env.DEV
            ? 'Could not reach the API on :3000. Start it with `npm run dev` (which runs the client and server together), not just `npm run dev:client`.'
            : 'Could not reach the server. Check your connection and try again.',
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm transition focus:border-accent focus:outline-none';

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {error ? (
        <StatusMessage tone="error">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </StatusMessage>
      ) : null}

      <Button type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
