import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Car,
  Code2,
  FileQuestion,
  MapPin,
  MessageCircle,
  Network,
  Table2,
  Trophy,
} from "lucide-react";

type Project = {
  title: string;
  year: string;
  label: string;
  summary: string;
  stack: string[];
  link?: string;
  image?: string;
  imageAlt?: string;
  accent: string;
  Icon: typeof Table2;
};

const featuredProjects: Project[] = [
  {
    title: "WhatsAppWrapped",
    year: "2026",
    label: "chat archaeology",
    summary:
      "A local-first Next.js analyzer that turns exported WhatsApp chats into a museum-style recap with quotes, running jokes, podiums, share cards, and media parsing.",
    stack: ["Next 16", "React 19", "TypeScript", "Anthropic SDK", "framer-motion"],
    link: "https://github.com/JakeG12345/WhatsAppWrapped",
    accent: "ink-green",
    Icon: MessageCircle,
  },
  {
    title: "Jashby / Daily Excel",
    year: "2025-26",
    label: "spreadsheet puzzles",
    summary:
      "An Excel-style learning game and daily challenge system using Univer Sheets, Firebase user state, analytics, levels, subscriptions, and onboarding flows.",
    stack: ["Next", "Firebase", "Univer Sheets", "TypeScript", "Vercel"],
    link: "https://github.com/JakeG12345/jashby-react",
    image: "/projects/daily-excel.png",
    imageAlt: "Daily Excel challenge completion screenshot",
    accent: "excel-green",
    Icon: Table2,
  },
  {
    title: "Car Lifestory",
    year: "2025-26",
    label: "vehicle memory",
    summary:
      "A web and mobile pair for vehicle service records: Supabase auth, ownership timelines, cloud sync, PDF/CSV export, and scan-to-form service extraction.",
    stack: ["Next 16", "Expo", "Supabase", "OpenAI API", "TypeScript"],
    link: "https://github.com/JakeG12345/car-records-web",
    image: "/projects/car-lifestory.png",
    imageAlt: "Car Lifestory mobile service timeline screenshot",
    accent: "road-blue",
    Icon: Car,
  },
  {
    title: "HSC MC Maker",
    year: "2025",
    label: "study tooling",
    summary:
      "A React Native Expo app for making and practising HSC multiple-choice questions, built around fast question entry and answer-key fixes.",
    stack: ["Expo SDK 54", "React Native", "TypeScript"],
    link: "https://github.com/Josephmosh/hsc-mc-maker",
    accent: "paper-yellow",
    Icon: FileQuestion,
  },
  {
    title: "Degree6",
    year: "2025",
    label: "network map",
    summary:
      "A D3-powered LinkedIn network explorer that models degrees of separation, search, filtering, and graph navigation from a React/Vite frontend and Express backend.",
    stack: ["React", "D3", "Vite", "Express", "TypeScript"],
    link: "https://github.com/JakeG12345/degree6",
    accent: "signal-violet",
    Icon: Network,
  },
  {
    title: "Moriah Jiu-Jitsu",
    year: "2025",
    label: "club ops",
    summary:
      "A tournament and training companion for Moriah jiu-jitsu, including Firebase-backed Next.js flows and practical competition explanation screens.",
    stack: ["Next 15", "Firebase", "React 19", "Tailwind"],
    link: "https://github.com/JakeG12345/moriah-jiu-jitsu-2",
    image: "/projects/jiu-jitsu.png",
    imageAlt: "Moriah Jiu-Jitsu app screenshot",
    accent: "mat-red",
    Icon: Trophy,
  },
];

const earlyWork = [
  ["2021", "Swift arcade games", "Atari Breakout, Space Invaders, Helicopter"],
  ["2023", "CS50 final", "Idea Aid with Flask, SQL, and the ChatGPT API"],
  ["2024", "Flutter drills", "Quotes, Ninja ID, world time, emergency app"],
  ["2025", "Daily tools", "Excel challenges, HSC practice, club apps"],
  ["2026", "Personal data stories", "WhatsAppWrapped and Car Lifestory polish"],
];

const stats = [
  ["17", "public GitHub repos"],
  ["6", "featured builds"],
  ["Sydney", "base"],
  ["Jashby", "current company thread"],
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-media" aria-hidden="true">
          <Image
            className="hero-shot hero-shot-a"
            src="/projects/jashby.png"
            alt=""
            width={680}
            height={425}
            priority
          />
          <Image
            className="hero-shot hero-shot-b"
            src="/projects/car-lifestory.png"
            alt=""
            width={295}
            height={639}
            priority
          />
          <Image
            className="hero-shot hero-shot-c"
            src="/projects/brackets.webp"
            alt=""
            width={360}
            height={450}
            priority
          />
        </div>

        <nav className="topbar" aria-label="Primary navigation">
          <a className="wordmark" href="#top" aria-label="Jake Glick home">
            JG
          </a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#timeline">Timeline</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <div className="hero-copy">
          <p className="kicker">
            <MapPin size={16} aria-hidden="true" />
            Sydney / Moriah / Jashby
          </p>
          <h1 id="hero-title">Jake Glick</h1>
          <p className="hero-lede">
            Young entrepreneurial software developer building spreadsheet
            games, social-data museums, car-history tools, and the odd school
            utility that gets surprisingly serious.
          </p>
          <div className="hero-actions" aria-label="Profile links">
            <a
              className="action-link primary-action"
              href="https://github.com/JakeG12345"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={18} aria-hidden="true" />
              GitHub
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="action-link"
              href="https://au.linkedin.com/in/jake-glick-312a02284"
              target="_blank"
              rel="noreferrer"
            >
              <BriefcaseBusiness size={18} aria-hidden="true" />
              LinkedIn
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="source-note" aria-label="Source note">
          <span>public trail + local Dev folder</span>
          <strong>projects checked, rough edges kept</strong>
        </aside>
      </section>

      <section className="stats-band" aria-label="Quick stats">
        {stats.map(([value, label]) => (
          <div className="stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="section intro-grid" aria-labelledby="brief-title">
        <div>
          <p className="eyebrow">builder profile</p>
          <h2 id="brief-title">
            Not a template person. More like a pile of working prototypes that
            learned how to behave.
          </h2>
        </div>
        <p>
          The through-line is practical software with a bit of personality:
          tools for studying, remembering, visualising, competing, and making
          data feel less dead. The work jumps between web apps, mobile apps,
          spreadsheets, graphs, auth, exports, and analysis pipelines.
        </p>
      </section>

      <section className="section work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading">
          <p className="eyebrow">selected work</p>
          <h2 id="work-title">Six builds from the desk</h2>
        </div>

        <div className="project-grid">
          {featuredProjects.map((project, index) => (
            <article
              className={`project-card ${project.accent}`}
              key={project.title}
            >
              <div className="project-card-top">
                <div className="project-icon" aria-hidden="true">
                  <project.Icon size={22} />
                </div>
                <div>
                  <p>{project.year}</p>
                  <span>{project.label}</span>
                </div>
              </div>

              <div className="project-visual">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.imageAlt ?? `${project.title} screenshot`}
                    fill
                    sizes="(max-width: 760px) 100vw, 44vw"
                    className={index === 2 ? "phone-shot" : undefined}
                  />
                ) : (
                  <div className="generated-visual" aria-hidden="true">
                    <Image
                      src="/projects/whatsappwrapped.svg"
                      alt=""
                      width={72}
                      height={72}
                    />
                    <div className="chat-lines">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="mini-podium">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                )}
              </div>

              <div className="project-copy">
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>

              <div className="stack-list" aria-label={`${project.title} stack`}>
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              {project.link ? (
                <a
                  className="project-link"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={17} aria-hidden="true" />
                  repo trail
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        className="section process-section"
        id="timeline"
        aria-labelledby="timeline-title"
      >
        <div className="section-heading">
          <p className="eyebrow">timeline</p>
          <h2 id="timeline-title">The non-linear bit</h2>
        </div>

        <div className="timeline">
          {earlyWork.map(([year, title, detail]) => (
            <article className="timeline-item" key={year}>
              <span>{year}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact-section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">contact</p>
          <h2 id="contact-title">Best way in is probably the public trail.</h2>
          <p>
            The site is already wired to the LinkedIn and GitHub profiles I
            could verify publicly. Add email, live demos, or private repo links
            when you want the portfolio to go from archive to application-ready.
          </p>
        </div>
        <div className="contact-actions">
          <a
            className="icon-button"
            href="https://github.com/JakeG12345"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            title="GitHub"
          >
            <Code2 size={22} aria-hidden="true" />
          </a>
          <a
            className="icon-button"
            href="https://au.linkedin.com/in/jake-glick-312a02284"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
            title="LinkedIn"
          >
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>Jake Glick portfolio</span>
        <span>Built from public GitHub, LinkedIn preview, and local project notes.</span>
      </footer>
    </main>
  );
}
