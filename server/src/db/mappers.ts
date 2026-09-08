import type { Award, ContactMessage, Project } from '@portfolio/shared';

/**
 * Postgres uses snake_case, the API speaks camelCase. These mappers are the one
 * place that translation happens, so route handlers only ever see domain types.
 */

export interface ProjectRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  tech: string[];
  repo_url: string | null;
  live_url: string | null;
  image_url: string | null;
  year: number | null;
  featured: boolean;
  sort_order: number;
}

export interface AwardRow {
  id: number;
  title: string;
  issuer: string;
  year: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: Date;
  read_at: Date | null;
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    tech: row.tech,
    repoUrl: row.repo_url,
    liveUrl: row.live_url,
    imageUrl: row.image_url,
    year: row.year,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

export function toAward(row: AwardRow): Award {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    year: row.year,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

export function toContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at.toISOString(),
    readAt: row.read_at ? row.read_at.toISOString() : null,
  };
}
