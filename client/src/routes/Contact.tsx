import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CONTACT, SOCIAL } from '@/data/profile';
import { ContactForm } from '@/components/ContactForm';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/Icons';
import { Page, SectionHeading } from '@/components/ui';

const links = [
  {
    href: `mailto:${CONTACT.email}`,
    icon: MailIcon,
    label: 'Email',
    value: CONTACT.email,
    external: false,
  },
  {
    href: SOCIAL.linkedin,
    icon: LinkedInIcon,
    label: 'LinkedIn',
    value: 'Bryan Chua',
    external: true,
  },
  {
    href: SOCIAL.github,
    icon: GitHubIcon,
    label: 'GitHub',
    value: '@Bryantooyah',
    external: true,
  },
];

export function Contact() {
  useDocumentTitle('Contact', 'Get in touch with Bryan Chua.');

  return (
    <Page>
      <SectionHeading
        level={1}
        eyebrow="Contact"
        title="Get in touch"
        description="Open to internships and freelance full-stack work. Messages reach me directly — I usually reply within a few days."
      />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-accent"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="block truncate text-sm text-muted">{link.value}</span>
                </span>
              </a>
            );
          })}

          <p className="pt-2 text-xs leading-relaxed text-muted">
            Based in {CONTACT.location}. The form stores your message and emails it to me —
            it doesn&apos;t go to any third-party service.
          </p>
        </div>
      </div>
    </Page>
  );
}
