import type {
  Award,
  AdminUser,
  ContactMessage,
  ContactPayload,
  GitHubStats,
  Project,
} from '@portfolio/shared';

/**
 * Empty in the normal deployment: the API is same-origin on Vercel, and in dev
 * Vite proxies /api to localhost:3000. Only set VITE_API_BASE_URL if the server
 * is deployed separately (the Render fallback).
 */
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/** Fail fast rather than leaving the page spinning on an unreachable API. */
const TIMEOUT_MS = 6000;

export class ApiError extends Error {
  readonly status: number;
  readonly details: Record<string, string[]> | undefined;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    // Sends the admin session cookie. Required for every /api/admin call.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.status === 204) return undefined as T;

  /*
    The content type is checked, not just the status.

    Both this app's dev server and Vercel rewrite anything that is not a real
    file to /index.html. So if the API function is missing, fails to deploy, or
    the /api rewrite is misrouted, a request to /api/projects comes back as
    HTML with a 200 rather than a 404. Parsing that and returning the result
    would hand callers `null` while looking like success — and a component
    rendering `null.length` crashes the whole page, which is exactly the outcome
    the bundled fallback exists to prevent.
  */
  const isJson = (response.headers.get('content-type') ?? '').includes('application/json');
  const body: unknown = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const payload = body as { error?: string; details?: Record<string, string[]> } | null;
    throw new ApiError(
      response.status,
      payload?.error ?? `Request failed (${String(response.status)})`,
      payload?.details,
    );
  }

  if (!isJson || body === null) {
    throw new ApiError(
      response.status,
      'The API returned a non-JSON response — it is probably not deployed correctly.',
    );
  }

  return body as T;
}

/*
  Module-level function declarations, not inline arrows. useResource takes the
  fetcher as an effect dependency, so it must be referentially stable across
  renders or the effect would re-run on every render.
*/

export function getProjects(): Promise<Project[]> {
  return request<Project[]>('/api/projects');
}

export function getProject(slug: string): Promise<Project> {
  return request<Project>(`/api/projects/${encodeURIComponent(slug)}`);
}

export function getAwards(): Promise<Award[]> {
  return request<Award[]>('/api/awards');
}

export function getGitHubStats(owner: string, repo: string): Promise<GitHubStats> {
  return request<GitHubStats>(
    `/api/github/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
}

export function sendContact(payload: ContactPayload): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(email: string, password: string): Promise<AdminUser> {
  return request<AdminUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function getCurrentAdmin(): Promise<AdminUser> {
  return request<AdminUser>('/api/auth/me');
}

export function getMessages(): Promise<ContactMessage[]> {
  return request<ContactMessage[]>('/api/admin/messages');
}

export function createProject(input: Partial<Project>): Promise<Project> {
  return request<Project>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateProject(id: number, input: Partial<Project>): Promise<Project> {
  return request<Project>(`/api/admin/projects/${String(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteProject(id: number): Promise<void> {
  return request<void>(`/api/admin/projects/${String(id)}`, { method: 'DELETE' });
}

export function createAward(input: Partial<Award>): Promise<Award> {
  return request<Award>('/api/admin/awards', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAward(id: number, input: Partial<Award>): Promise<Award> {
  return request<Award>(`/api/admin/awards/${String(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAward(id: number): Promise<void> {
  return request<void>(`/api/admin/awards/${String(id)}`, { method: 'DELETE' });
}
