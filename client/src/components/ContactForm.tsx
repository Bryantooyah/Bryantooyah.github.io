import { useState, type FormEvent } from 'react';
import { ApiError, sendContact } from '@/lib/api';
import { AlertIcon, CheckIcon } from './Icons';
import { Button, StatusMessage } from './ui';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  errors?: string[];
  multiline?: boolean;
}

function Field({ id, label, type = 'text', required, errors, multiline }: FieldProps) {
  const errorId = `${id}-error`;
  const inputClass = [
    'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm transition',
    'placeholder:text-muted focus:border-accent focus:outline-none',
    errors?.length ? 'border-red-500' : 'border-border',
  ].join(' ');

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          required={required}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? errorId : undefined}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? errorId : undefined}
          className={inputClass}
        />
      )}

      {errors?.length ? (
        <p id={errorId} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {errors.join(' ')}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus('sending');
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await sendContact({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        subject: String(data.get('subject') ?? ''),
        message: String(data.get('message') ?? ''),
        website: String(data.get('website') ?? ''),
      });

      setStatus('sent');
      setMessage("Thanks — your message is with me. I'll reply to the email you gave.");
      form.reset();
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setFieldErrors(err.details ?? {});
        setMessage(
          err.details
            ? 'Please check the highlighted fields.'
            : err.message,
        );
      } else {
        // Network failure, timeout, or the API being unreachable. Give the
        // visitor a route that does not depend on the server working.
        setMessage(
          'Could not reach the server. Please email me directly at bcbryanchua@gmail.com.',
        );
      }
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" required errors={fieldErrors.name} />
        <Field id="email" label="Email" type="email" required errors={fieldErrors.email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone (optional)" type="tel" errors={fieldErrors.phone} />
        <Field id="subject" label="Subject" required errors={fieldErrors.subject} />
      </div>

      <Field id="message" label="Message" required multiline errors={fieldErrors.message} />

      {/*
        Honeypot. Hidden from sight and from the tab order, and never announced,
        so no real visitor can fill it in — but scrapers fill every input they
        find, which is how the server spots them.
      */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>

        {status === 'sent' ? (
          <StatusMessage tone="success">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </StatusMessage>
        ) : null}

        {status === 'error' ? (
          <StatusMessage tone="error">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </StatusMessage>
        ) : null}
      </div>
    </form>
  );
}
