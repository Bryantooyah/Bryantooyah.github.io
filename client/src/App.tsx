import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './routes/Home';
import { Projects } from './routes/Projects';
import { About } from './routes/About';
import { Credentials } from './routes/Credentials';
import { Contact } from './routes/Contact';
import { NotFound } from './routes/NotFound';

/*
  Split out of the main bundle. ProjectDetail pulls in react-markdown, and Admin
  pulls in every editor panel — neither is needed to render the pages people
  actually land on, and almost nobody opens the admin panel at all.
*/
const ProjectDetail = lazy(() =>
  import('./routes/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
);
const Admin = lazy(() => import('./routes/Admin').then((m) => ({ default: m.Admin })));

/**
 * Resets scroll on navigation. Without this the browser keeps the previous
 * page's scroll offset, so following a link from halfway down a long page
 * lands you halfway down the next one.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />

      {/* First tab stop on every page: lets keyboard users jump the nav. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-fg"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main">
        <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-16 text-muted">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
