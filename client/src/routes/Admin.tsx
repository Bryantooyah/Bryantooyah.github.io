import { useEffect, useState } from 'react';
import type { AdminUser } from '@portfolio/shared';
import { getCurrentAdmin, logout } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LoginForm } from '@/components/admin/LoginForm';
import { ProjectsPanel } from '@/components/admin/ProjectsPanel';
import { AwardsPanel } from '@/components/admin/AwardsPanel';
import { MessagesPanel } from '@/components/admin/MessagesPanel';
import { Button, Page } from '@/components/ui';

type Tab = 'projects' | 'awards' | 'messages';

const TABS: { id: Tab; label: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'awards', label: 'Credentials' },
  { id: 'messages', label: 'Messages' },
];

export function Admin() {
  useDocumentTitle('Admin');

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('projects');

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then((user) => {
        if (!cancelled) setAdmin(user);
      })
      .catch(() => {
        // Not signed in, or the API is unreachable. Either way: show the form.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout(): Promise<void> {
    await logout().catch(() => undefined);
    setAdmin(null);
  }

  if (checking) {
    return (
      <Page>
        <p className="text-muted">Checking your session…</p>
      </Page>
    );
  }

  if (!admin) {
    return (
      <Page>
        <div className="mx-auto max-w-sm">
          <h1 className="mb-1 text-2xl font-bold tracking-tight">Admin</h1>
          <p className="mb-6 text-sm text-muted">Sign in to manage site content.</p>
          <LoginForm onSuccess={setAdmin} />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-muted">Signed in as {admin.email}</p>
        </div>
        <Button variant="outline" onClick={() => void handleLogout()}>
          Sign out
        </Button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => {
              setTab(entry.id);
            }}
            className={[
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === entry.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-text',
            ].join(' ')}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'projects' ? <ProjectsPanel /> : null}
      {tab === 'awards' ? <AwardsPanel /> : null}
      {tab === 'messages' ? <MessagesPanel /> : null}
    </Page>
  );
}
