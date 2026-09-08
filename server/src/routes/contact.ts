import { createHash } from 'node:crypto';
import { Router } from 'express';
import type { Request } from 'express';
import { Resend } from 'resend';
import { query } from '../db/pool.js';
import { env, features, secret } from '../env.js';
import { contactSchema, type ContactInput } from '../schemas/index.js';
import { HttpError } from '../lib/http.js';

export const contactRouter: Router = Router();

/**
 * Hashes the caller's IP with the server secret. Enough to recognise a repeat
 * sender for rate limiting without storing anyone's actual address.
 */
function hashIp(req: Request): string | null {
  const ip = req.ip;
  if (!ip) return null;
  return createHash('sha256').update(`${ip}:${secret}`).digest('hex');
}

/**
 * Rate limiting is a database COUNT rather than an in-memory counter on
 * purpose. On Vercel every request may land in a fresh process, so
 * process-local state would reset constantly and silently enforce nothing.
 */
async function isRateLimited(ipHash: string | null): Promise<boolean> {
  if (!ipHash) return false;
  const { rows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM contact_messages
     WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [ipHash],
  );
  return (rows[0]?.count ?? 0) >= env.CONTACT_RATE_LIMIT;
}

async function sendNotification(input: ContactInput): Promise<void> {
  if (!features.email || !env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) return;

  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
    // Replying in an email client goes straight back to the sender.
    replyTo: input.email,
    subject: `Portfolio contact: ${input.subject}`,
    text: [
      `From: ${input.name} <${input.email}>`,
      input.phone ? `Phone: ${input.phone}` : null,
      '',
      input.message,
    ]
      .filter((line) => line !== null)
      .join('\n'),
  });
}

contactRouter.post('/', async (req, res) => {
  const input = contactSchema.parse(req.body);

  // Honeypot. Answer exactly as we would on success so a bot gets no signal
  // that it was detected, and store nothing.
  if (input.website && input.website.trim() !== '') {
    res.status(202).json({ ok: true });
    return;
  }

  const ipHash = hashIp(req);
  if (await isRateLimited(ipHash)) {
    throw HttpError.tooManyRequests(
      'You have sent several messages recently. Please try again in an hour, or email me directly.',
    );
  }

  await query(
    `INSERT INTO contact_messages (name, email, phone, subject, message, ip_hash, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.name,
      input.email,
      input.phone ?? null,
      input.subject,
      input.message,
      ipHash,
      req.get('user-agent') ?? null,
    ],
  );

  // The message is already durably stored, so a mail outage must not surface as
  // a failed submission — that would push the sender to submit again.
  try {
    await sendNotification(input);
  } catch (err) {
    console.error('Contact stored but notification email failed:', err);
  }

  res.status(201).json({ ok: true });
});
