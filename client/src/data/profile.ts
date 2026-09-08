/**
 * Static profile content — the parts of the site that are about Bryan rather
 * than about his work, and so don't belong in the database or the admin CMS.
 * Edit here and redeploy.
 *
 * Kept in sync with the resume (V8). When the resume changes, update this file.
 */

export const SOCIAL = {
  github: 'https://github.com/Bryantooyah',
  linkedin: 'https://www.linkedin.com/in/bryan-chua-591221231',
} as const;

export const PROFILE = {
  name: 'Bryan Chua',
  fullName: 'Bryan Chua Bing Huan',
  tagline:
    'CS undergrad at SUTD who loves building full-stack web apps, experimenting with AI, and automating the boring stuff away.',
  /**
   * Two different photos, deliberately. Aspect ratios are declared here because
   * they come from the source files and drive the CSS box — getting them wrong
   * causes layout shift as each image loads.
   */
  heroPhoto: {
    src: '/images/hero.webp',
    alt: 'Bryan Chua in Higashiyama, Kyoto, with Yasaka Pagoda behind',
    aspect: 'aspect-[2/3]',
  },
  aboutPhoto: {
    src: '/images/profile.webp',
    alt: 'Bryan Chua at Itsukushima Shrine, Miyajima',
    aspect: 'aspect-square',
  },
} as const;

export const CONTACT = {
  email: 'bcbryanchua@gmail.com',
  /**
   * The old site published a mobile number on every page, where scrapers
   * collect it. Contact now runs through the form and email instead. Set this
   * to a string if you decide you want it public again.
   */
  phone: null as string | null,
  location: 'Singapore',
} as const;

/**
 * The About page bio, one entry per paragraph. The tagline above opens it, so
 * it is not repeated here.
 */
export const BIO: string[] = [
  "I'm studying Computer Science and Design at SUTD, with minors in Analytics & AI and in Psychology & Business Management. Most of what I enjoy sits where those overlap: figuring out what people actually need, then building something that holds up in production.",
  "Before university, I spent two years as an Assistant Manpower Officer with the Singapore Police Force, running HR and data operations for a division of over a thousand officers. That's where I learned how much manual work quietly eats up a team's week — and it's the reason automation stuck with me. At CPF, I got to do something about it properly: replacing repetitive admin workflows with Python, UiPath, and Django dashboards the team still uses today.",
  "Competitions taught me the rest. The SPF Coding Challenge, DSTA's BrainHack AI hackathon, and building an AI avatar for the National AI Student Challenge all meant shipping something that actually worked under real time pressure — and that's the standard I still hold my own projects to.",
  "Outside of code, I play table tennis and study Japanese. I passed JLPT N3 in 2025 and I'm currently working toward N2.",
];

export interface SkillGroup {
  name: string;
  skills: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: 'Languages',
    skills: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C', 'SQL'],
  },
  {
    name: 'Frameworks',
    skills: ['React', 'Django', 'Node.js', 'Express.js'],
  },
  {
    name: 'Tools & platforms',
    skills: ['Git', 'Docker', 'PostgreSQL', 'Android Studio', 'UiPath', 'Power BI', 'Power Automate'],
  },
  {
    name: 'Spoken',
    skills: ['English (native)', 'Chinese (mother tongue)', 'Japanese (JLPT N3)'],
  },
];

export interface ExperienceEntry {
  role: string;
  organisation: string;
  /** Official site, linked from the organisation name. */
  url: string | null;
  /**
   * Path under client/public. Missing files fall back to a monogram, so a logo
   * you have not added yet never renders as a broken image.
   */
  logo: string | null;
  period: string;
  points: string[];
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: 'Business Process Automation Intern',
    organisation: 'Central Provident Fund Board',
    url: 'https://www.cpf.gov.sg',
    logo: '/images/logo-cpf.webp',
    period: 'Sep 2025 — Dec 2025',
    points: [
      'Built automation for internal administrative workflows using Python, VBA, UiPath, Power BI and Power Automate.',
      'Developed full-stack Django dashboards for staff demographics and software-licence tracking, with interactive visualisations and full CRUD, used by the team.',
      'Automated bulk email drafting by wiring the dashboards into Microsoft Outlook via pywin32, removing manual work from onboarding, offboarding and access requests.',
      'Wrote the technical documentation and handover guides that keep it running after the internship.',
    ],
  },
  {
    role: 'Assistant Manpower Officer',
    organisation: 'Singapore Police Force',
    url: 'https://www.police.gov.sg/',
    logo: '/images/logo-spf.webp',
    period: 'Sep 2022 — Feb 2024',
    points: [
      'Ran daily HR and data operations for over 1,000 officers in TRANSCOM, accountable for data accuracy across the division.',
      'Co-led a 15-member administrative team, liaising with internal and external stakeholders.',
    ],
  },
];

export interface EducationEntry {
  qualification: string;
  institution: string;
  url: string | null;
  logo: string | null;
  period: string;
  points: string[];
}

export const EDUCATION: EducationEntry[] = [
  {
    qualification: 'Computer Science and Design',
    institution: 'Singapore University of Technology and Design',
    url: 'https://www.sutd.edu.sg',
    logo: '/images/logo-sutd.webp',
    period: 'Sep 2024 — Sep 2028',
    points: [
      'Minor in Analytics and AI; Minor in Psychology & Business Management.',
      'Recipient of the SUTD Undergraduate Merit Scholarship.',
    ],
  },
];
