import { useEffect, useState } from 'react';
import type { ContactMessage } from '@portfolio/shared';
import { getMessages } from '@/lib/api';
import { AlertIcon } from '../Icons';
import { StatusMessage } from '../ui';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMessages()
      .then((result) => {
        if (!cancelled) setMessages(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load messages');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading messages…</p>;

  if (error) {
    return (
      <StatusMessage tone="error">
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
        {error}
      </StatusMessage>
    );
  }

  if (messages.length === 0) {
    return <p className="text-sm text-muted">No messages yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li key={message.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{message.subject}</p>
            <time dateTime={message.createdAt} className="font-mono text-xs text-muted">
              {formatDate(message.createdAt)}
            </time>
          </div>

          <p className="text-sm text-muted">
            {message.name} ·{' '}
            <a
              href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
              className="text-accent hover:underline"
            >
              {message.email}
            </a>
            {message.phone ? ` · ${message.phone}` : null}
          </p>

          {/* whitespace-pre-wrap preserves the sender's paragraph breaks. */}
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
        </li>
      ))}
    </ul>
  );
}
