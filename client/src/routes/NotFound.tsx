import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ButtonLink, Page } from '@/components/ui';

export function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <Page>
      <div className="py-16 text-center">
        <p className="font-mono text-6xl font-bold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          The link may be out of date. The old site used <code className="font-mono">/homepage/</code>{' '}
          paths that no longer exist.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink to="/">Back home</ButtonLink>
          <ButtonLink to="/projects" variant="outline">
            See projects
          </ButtonLink>
        </div>
      </div>
    </Page>
  );
}
