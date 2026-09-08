import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';
import * as api from '@/lib/api';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/^name/i), 'Jane Recruiter');
  await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/^subject/i), 'Internship');
  await user.type(screen.getByLabelText(/^message/i), 'Hello Bryan, I have an opportunity.');
}

describe('ContactForm', () => {
  it('sends the message and confirms to the visitor', async () => {
    const user = userEvent.setup();
    const send = vi.spyOn(api, 'sendContact').mockResolvedValue({ ok: true });

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/thanks/i);
    });
    expect(send).toHaveBeenCalledOnce();
  });

  it('surfaces field-level errors from the API', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'sendContact').mockRejectedValue(
      new api.ApiError(400, 'Validation failed', {
        email: ['That does not look like a valid email'],
      }),
    );

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/not look like a valid email/i)).toBeInTheDocument();
    });
    // The message must be associated with the input, not just floating nearby.
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('offers a direct email address when the server is unreachable', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'sendContact').mockRejectedValue(new TypeError('Failed to fetch'));

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // A dead API must not be a dead end — the fallback route has to be visible.
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/bcbryanchua@gmail\.com/);
    });
  });

  it('keeps the honeypot out of the tab order', () => {
    render(<ContactForm />);
    // A real visitor must never be able to reach or fill this field.
    expect(screen.getByLabelText('Website')).toHaveAttribute('tabindex', '-1');
  });
});
