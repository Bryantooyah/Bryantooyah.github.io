import { useEffect, useState, type FormEvent } from 'react';
import type { Project } from '@portfolio/shared';
import { createProject, deleteProject, getProject, getProjects, updateProject } from '@/lib/api';
import { AlertIcon } from '../Icons';
import { Button, StatusMessage } from '../ui';
import {
  CheckboxField,
  EditorShell,
  TextAreaField,
  TextField,
  optionalNumber,
  optionalString,
  parseList,
} from './fields';

export function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh(): Promise<void> {
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load projects');
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function startEditing(project: Project): Promise<void> {
    // The list endpoint omits `description`, so fetch the full record before
    // opening the editor — otherwise saving would blank out the case study.
    try {
      setEditing(await getProject(project.slug));
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load that project');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      slug: String(data.get('slug') ?? '').trim(),
      title: String(data.get('title') ?? '').trim(),
      summary: String(data.get('summary') ?? '').trim(),
      description: optionalString(data, 'description'),
      tech: parseList(data, 'tech'),
      repoUrl: optionalString(data, 'repoUrl'),
      liveUrl: optionalString(data, 'liveUrl'),
      imageUrl: optionalString(data, 'imageUrl'),
      year: optionalNumber(data, 'year'),
      featured: data.get('featured') === 'on',
      sortOrder: optionalNumber(data, 'sortOrder') ?? 0,
    };

    try {
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
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

  async function handleDelete(project: Project): Promise<void> {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(project.id);
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
          New project
        </Button>
      ) : null}

      {showEditor ? (
        <EditorShell title={editing ? `Edit: ${editing.title}` : 'New project'}>
          {/* key remounts the form when the target changes, so defaultValue
              reflects the newly selected project rather than the previous one. */}
          <form
            key={editing?.id ?? 'new'}
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="slug"
                label="Slug"
                required
                defaultValue={editing?.slug}
                hint="lowercase-with-hyphens — becomes the URL"
              />
              <TextField name="title" label="Title" required defaultValue={editing?.title} />
            </div>

            <TextField name="summary" label="Summary" required defaultValue={editing?.summary} />

            <TextField
              name="tech"
              label="Tech"
              defaultValue={editing?.tech.join(', ')}
              hint="Comma separated"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="repoUrl" label="Repository URL" defaultValue={editing?.repoUrl} />
              <TextField name="liveUrl" label="Live URL" defaultValue={editing?.liveUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <TextField name="imageUrl" label="Image path" defaultValue={editing?.imageUrl} />
              <TextField name="year" label="Year" type="number" defaultValue={editing?.year} />
              <TextField
                name="sortOrder"
                label="Sort order"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
              />
            </div>

            <TextAreaField
              name="description"
              label="Case study (Markdown)"
              defaultValue={editing?.description}
              rows={14}
            />

            <CheckboxField name="featured" label="Featured on the home page" defaultChecked={editing?.featured} />

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
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {project.title}
                {project.featured ? <span className="ml-2 text-xs text-accent">featured</span> : null}
              </p>
              <p className="truncate font-mono text-xs text-muted">/{project.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void startEditing(project)}>
                Edit
              </Button>
              <Button variant="outline" onClick={() => void handleDelete(project)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
