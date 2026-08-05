"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Car,
  Code2,
  FileQuestion,
  Gamepad2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Network,
  Smartphone,
  Table2,
  Trophy,
  Video,
} from "lucide-react";

type ExhibitLink = {
  label: string;
  href: string;
  kind: "repo" | "live" | "video" | "store" | "contact";
};

type Exhibit = {
  id: string;
  title: string;
  shortTitle: string;
  period: string;
  zone: string;
  status: string;
  summary: string;
  details: string;
  stack: string[];
  proof: string[];
  source: string;
  image?: string;
  imageAlt?: string;
  accent: string;
  x: number;
  y: number;
  Icon: LucideIcon;
  links: ExhibitLink[];
};

type Experience = {
  company: string;
  role: string;
  date: string;
  detail: string;
};

const exhibits: Exhibit[] = [
  {
    id: "whatsapp-wrapped",
    title: "WhatsAppWrapped",
    shortTitle: "Wrapped",
    period: "2026",
    zone: "Archive District",
    status: "Blackbird camp build, public GitHub repo",
    summary:
      "A local-first WhatsApp export analyzer that turns group chats into a recap deck and a walkable museum.",
    details:
      "The app parses .txt and .zip exports in the browser, calculates stats locally, creates shareable card decks, and keeps raw chat data out of storage. It has a lobby, story mode, museum mode, and an archive district for multiple chats.",
    stack: ["Next 16", "React 19", "TypeScript", "Anthropic SDK", "Drizzle", "Better Auth"],
    proof: ["Public repo created July 8, 2026", "Local README privacy model", "Safe app screenshot used"],
    source: "GitHub API, local README, local screenshots",
    image: "/projects/whatsapp-wrapped-cover.png",
    imageAlt: "WhatsAppWrapped recap cover screen",
    accent: "#22d66f",
    x: 20,
    y: 28,
    Icon: MessageCircle,
    links: [
      {
        label: "GitHub",
        href: "https://github.com/JakeG12345/WhatsAppWrapped",
        kind: "repo",
      },
    ],
  },
  {
    id: "jashby",
    title: "Jashby",
    shortTitle: "Jashby",
    period: "2024-2026",
    zone: "Spreadsheet Gallery",
    status: "Co-founder / CEO thread",
    summary:
      "An interactive platform for learning spreadsheet software through game-like levels and daily challenges.",
    details:
      "Built with co-founders while at school, Jashby turns Excel and Google Sheets practice into playable lessons. The local projects include a larger product app and a Daily Excel challenge system powered by Univer Sheets, Firebase, analytics, onboarding, and subscriptions.",
    stack: ["Next", "Firebase", "Univer Sheets", "TypeScript", "Vercel", "Analytics"],
    proof: ["jashby.com live", "Local Jashby folders", "DOCX founder narrative"],
    source: "Attached DOCX, live site, local project folders",
    image: "/projects/jashby-product.png",
    imageAlt: "Jashby product artwork showing spreadsheet learning",
    accent: "#18b96f",
    x: 50,
    y: 18,
    Icon: Table2,
    links: [
      {
        label: "Live site",
        href: "https://jashby.com",
        kind: "live",
      },
    ],
  },
  {
    id: "car-lifestory",
    title: "Car Lifestory",
    shortTitle: "Car",
    period: "2026",
    zone: "Garage Records",
    status: "Web + mobile app pair",
    summary:
      "A vehicle history tracker for service records, ownership timelines, costs, exports, and AI-assisted scan-to-form entry.",
    details:
      "Built after getting Ps and wanting to make sense of a manual 2002 Audi TT's paperwork. The web app handles auth, marketing, pricing, dashboard flows, and the extraction API; the Expo app manages vehicle records, local persistence, exports, deep links, and Supabase sync groundwork.",
    stack: ["Next 16", "Expo", "React Native", "Supabase", "OpenAI API", "TypeScript"],
    proof: ["carlifestory.vercel.app live", "Mobile simulator screenshot", "Local web and Expo READMEs"],
    source: "Attached DOCX, live site, local app folders",
    image: "/projects/live-car-lifestory.png",
    imageAlt: "Car Lifestory live landing page screenshot",
    accent: "#17bddd",
    x: 78,
    y: 30,
    Icon: Car,
    links: [
      {
        label: "Live site",
        href: "https://carlifestory.vercel.app",
        kind: "live",
      },
    ],
  },
  {
    id: "what-the-puck",
    title: "What The Puck",
    shortTitle: "Puck",
    period: "2022-2024",
    zone: "Launch Cabinet",
    status: "First public mobile launch",
    summary:
      "A Unity mobile game crossing golf and ice hockey, launched publicly on iOS and Android with AIgile.",
    details:
      "Jake taught himself Unity through tutorials, connected with AIgile / 3rd Sense, and worked as lead developer on gameplay, frontend, and backend pieces. The live website and app store trail make it the first fully public project in the museum.",
    stack: ["Unity", "C#", "iOS", "Android", "Mobile game systems"],
    proof: ["Live website screenshot", "App Store listing", "Attached DOCX launch story"],
    source: "Attached DOCX, live site, App Store link",
    image: "/projects/live-whatthepuck.png",
    imageAlt: "What The Puck live website screenshot with game screens",
    accent: "#2787f0",
    x: 25,
    y: 60,
    Icon: Gamepad2,
    links: [
      {
        label: "Live site",
        href: "https://www.whatthepuck.app",
        kind: "live",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/what-the-puck/id6504596162",
        kind: "store",
      },
    ],
  },
  {
    id: "moriah-jiu-jitsu",
    title: "Moriah Jiu-Jitsu",
    shortTitle: "Jiu-Jitsu",
    period: "2025",
    zone: "Tournament Desk",
    status: "School competition tool",
    summary:
      "A Next/Firebase site for a school jiu-jitsu program with athletes, divisions, live competitions, scoring, and leaderboards.",
    details:
      "Built for the coordinator of the Moriah Jiu-Jitsu program so tournament operations could move through a dedicated web app instead of loose spreadsheets and manual scorekeeping.",
    stack: ["Next 15", "React 19", "Firebase", "Tailwind", "Vercel"],
    proof: ["moriah-jiujitsu.vercel.app live", "Local project folders", "Attached DOCX link"],
    source: "Attached DOCX, live site, local folders",
    image: "/projects/live-moriah-jiujitsu.png",
    imageAlt: "Moriah Jiu-Jitsu live site screenshot",
    accent: "#ff5b2e",
    x: 56,
    y: 70,
    Icon: Trophy,
    links: [
      {
        label: "Live site",
        href: "https://moriah-jiujitsu.vercel.app/",
        kind: "live",
      },
    ],
  },
  {
    id: "degree6",
    title: "Degree6",
    shortTitle: "Degree6",
    period: "2025",
    zone: "Network Room",
    status: "Locally run for screenshot",
    summary:
      "A D3-powered LinkedIn network explorer for visualising degrees of separation, search, filtering, and graph navigation.",
    details:
      "The local app runs a Vite React client and Express backend. I briefly started both servers, captured the working graph, and shut them down again so the portfolio can show the real interface.",
    stack: ["React", "D3", "Vite", "Express", "TypeScript"],
    proof: ["Local server run", "Screenshot captured from localhost", "GitHub repo shell found"],
    source: "Local README, local run, GitHub API",
    image: "/projects/degree6-live.png",
    imageAlt: "Degree6 network graph screenshot",
    accent: "#7c5cff",
    x: 80,
    y: 66,
    Icon: Network,
    links: [
      {
        label: "GitHub",
        href: "https://github.com/JakeG12345/degree6",
        kind: "repo",
      },
    ],
  },
  {
    id: "hsc-mc-maker",
    title: "HSC MC Maker",
    shortTitle: "HSC MC",
    period: "2025",
    zone: "Study Lab",
    status: "Expo app project",
    summary:
      "A React Native app for making and practising HSC multiple-choice questions with fast entry and answer-key fixes.",
    details:
      "The local Expo project does not currently have bundled screenshots or installed dependencies, so this room is represented as a study-lab artifact rather than a pretend app capture.",
    stack: ["Expo SDK 54", "React Native", "TypeScript"],
    proof: ["Local README", "Expo app config", "Repo link under collaborator account"],
    source: "Local README and app config",
    accent: "#f2b84b",
    x: 43,
    y: 46,
    Icon: FileQuestion,
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Josephmosh/hsc-mc-maker",
        kind: "repo",
      },
    ],
  },
];

const sideCases = [
  {
    title: "Idea Aid",
    year: "2023",
    detail:
      "CS50 final project with two friends: Flask, Python, SQL, Bootstrap, and the OpenAI API for generating ideas.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/JakeG12345/idea-aid",
        icon: Code2,
      },
      {
        label: "Submission video",
        href: "https://www.youtube.com/watch?v=BXPvE4tj9BQ",
        icon: Video,
      },
    ],
  },
  {
    title: "Decentralised Twitter",
    year: "2022",
    detail:
      "Polygon BUIDL IT hackathon entry: a Twitter-like app where data lived on the Polygon blockchain.",
    links: [
      {
        label: "Submission video",
        href: "https://www.youtube.com/watch?v=-SOcDpY46Us",
        icon: Video,
      },
    ],
  },
  {
    title: "Swift Arcade Trio",
    year: "2021",
    detail:
      "Early Xcode and Swift projects: Atari Breakout, Space Invaders, and Helicopter Arcade after learning iOS development.",
    links: [
      {
        label: "GitHub trail",
        href: "https://github.com/JakeG12345?tab=repositories&q=&type=&language=swift&sort=",
        icon: Code2,
      },
    ],
  },
  {
    title: "Pragma",
    year: "2022",
    detail:
      "A live early web build under Pragmatic Minds / NexGen styling. Not the main event, but a useful timestamp from the web era.",
    links: [
      {
        label: "Live site",
        href: "https://pragma-three.vercel.app",
        icon: Globe2,
      },
      {
        label: "GitHub",
        href: "https://github.com/JakeG12345/pragma",
        icon: Code2,
      },
    ],
  },
];

const experiences: Experience[] = [
  {
    company: "Jashby",
    role: "Co-Founder",
    date: "Nov 2024 - Present",
    detail:
      "Co-created an interactive platform that makes learning spreadsheet software easy and fun through gamified levels for Excel, Google Sheets, and more.",
  },
  {
    company: "AIgile",
    role: "Game Developer",
    date: "Sep 2022 - Dec 2024",
    detail:
      "Lead developer for What The Puck, a 2D Unity mobile game crossing golf with ice hockey, handling gameplay, frontend, and backend for iOS and Android.",
  },
  {
    company: "Quantium",
    role: "Work Experience",
    date: "Jul 2024",
    detail:
      "Worked with CommBank iQ data analytics and built a web scraper for client-market data from a live website.",
  },
  {
    company: "Breeze Wholesale Marketplace",
    role: "System Architect",
    date: "Jun 2023 - Jul 2023",
    detail:
      "Helped a startup founder scope a wholesale marketplace, estimate costs and timelines, and coordinate early website design work.",
  },
  {
    company: "3RD SENSE",
    role: "Game Developer",
    date: "Apr 2023 - Jun 2023",
    detail:
      "Primary frontend developer for a Unity quiz app, integrating the quiz API and turning designs into a usable mobile experience.",
  },
];

const timeline = [
  ["2020", "Arduino kit", "Saw a kit at Jaycar, learned modified C++, and started using code to make ideas physical."],
  ["2021", "Swift games", "Xcode, Swift, Breakout, Space Invaders, and Helicopter Arcade."],
  ["2022", "Web plus Web3", "HTML, CSS, JavaScript, React, Moralis, smart contracts, and a Polygon hackathon entry."],
  ["2023", "Teams and clients", "Idea Aid, system architecture consulting, and contracted game work."],
  ["2024", "Public launch", "What The Puck shipped to mobile stores; CS50AI and Quantium added data and AI context."],
  ["2025", "Tools for real people", "Jashby, Moriah Jiu-Jitsu, Degree6, and HSC study tooling."],
  ["2026", "Personal data stories", "Car Lifestory and WhatsAppWrapped turn messy real-world data into usable memory."],
];

const stats = [
  ["18", "public GitHub repos"],
  ["2021", "GitHub account created"],
  ["5", "role entries"],
  ["2026", "Moriah College grad"],
];

const sourceLog = [
  "Attached DOCX: coding journey, projects, links, and motivation.",
  "GitHub API: JakeG12345 public profile and repository metadata checked on August 5, 2026.",
  "Live captures: Jashby, What The Puck, Car Lifestory, Moriah Jiu-Jitsu, Pragma.",
  "Local runs: Degree6 Vite + Express stack started for a real screenshot.",
  "Local screenshots: WhatsAppWrapped safe cover screen and existing project media.",
];

function linkIcon(kind: ExhibitLink["kind"]) {
  if (kind === "repo") return Code2;
  if (kind === "store") return Smartphone;
  if (kind === "video") return Video;
  if (kind === "contact") return Mail;
  return Globe2;
}

export default function MuseumPortfolio() {
  const [activeId, setActiveId] = useState(exhibits[0].id);
  const activeIndex = exhibits.findIndex((room) => room.id === activeId);
  const active = exhibits[activeIndex] ?? exhibits[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!["arrowright", "arrowleft", "d", "a"].includes(key)) return;
      event.preventDefault();
      setActiveId((current) => {
        const index = exhibits.findIndex((room) => room.id === current);
        const next =
          key === "arrowright" || key === "d"
            ? (index + 1) % exhibits.length
            : (index - 1 + exhibits.length) % exhibits.length;
        return exhibits[next].id;
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const goToRelative = (amount: number) => {
    const next = (activeIndex + amount + exhibits.length) % exhibits.length;
    setActiveId(exhibits[next].id);
  };

  return (
    <main className="portfolio-shell">
      <section className="museum-hero" id="top" aria-labelledby="hero-title">
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="brand-mark" href="#top" aria-label="Jake Glick home">
            JG
          </a>
          <div className="nav-links">
            <a href="#museum">Museum</a>
            <a href="#timeline">Timeline</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <div className="hero-copy">
          <p className="kicker">
            <MapPin size={16} aria-hidden="true" />
            Sydney builder archive
          </p>
          <h1 id="hero-title">Jake Glick</h1>
          <p>
            A portfolio as a project museum: spreadsheet games, mobile launches,
            car records, school tools, data stories, and the early experiments
            that made the newer work possible.
          </p>
        </div>

        <div className="hero-preview" aria-label="Featured project preview">
          <Image
            src={active.image ?? "/projects/whatsappwrapped.svg"}
            alt={active.imageAlt ?? `${active.title} visual artifact`}
            fill
            sizes="(max-width: 980px) 100vw, 42vw"
            loading="eager"
          />
        </div>
      </section>

      <section className="stats-band" aria-label="Quick facts">
        {stats.map(([value, label]) => (
          <div className="stat-tile" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="museum-section" id="museum" aria-labelledby="museum-title">
        <div className="section-heading">
          <p className="eyebrow">archive district</p>
          <h2 id="museum-title">Walk the build history.</h2>
        </div>

        <div className="museum-stage">
          <div className="floorplan" aria-label="Project rooms">
            <div className="floor-grid" aria-hidden="true" />
            {exhibits.map((room) => (
              <button
                className={`room-node ${room.id === active.id ? "is-active" : ""}`}
                key={room.id}
                onClick={() => setActiveId(room.id)}
                style={
                  {
                    "--room-x": `${room.x}%`,
                    "--room-y": `${room.y}%`,
                    "--room-accent": room.accent,
                  } as CSSProperties
                }
                aria-pressed={room.id === active.id}
              >
                <span className="room-icon" aria-hidden="true">
                  <room.Icon size={16} />
                </span>
                <span>{room.shortTitle}</span>
              </button>
            ))}
            <div
              className="walker"
              style={
                {
                  "--walker-x": `${active.x}%`,
                  "--walker-y": `${active.y}%`,
                  "--walker-accent": active.accent,
                } as CSSProperties
              }
              aria-hidden="true"
            >
              JG
            </div>
          </div>

          <article
            className="exhibit-panel"
            style={{ "--active-accent": active.accent } as CSSProperties}
          >
            <div className="panel-controls">
              <button
                className="icon-control"
                type="button"
                onClick={() => goToRelative(-1)}
                aria-label="Previous exhibit"
                title="Previous exhibit"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <span>
                {String(activeIndex + 1).padStart(2, "0")} / {exhibits.length}
              </span>
              <button
                className="icon-control"
                type="button"
                onClick={() => goToRelative(1)}
                aria-label="Next exhibit"
                title="Next exhibit"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="exhibit-visual">
              {active.image ? (
                <Image
                  src={active.image}
                  alt={active.imageAlt ?? `${active.title} screenshot`}
                  fill
                  sizes="(max-width: 980px) 100vw, 44vw"
                />
              ) : (
                <div className="artifact-visual" aria-hidden="true">
                  <active.Icon size={58} />
                  <span>Exam builder</span>
                </div>
              )}
            </div>

            <div className="exhibit-copy">
              <p className="room-zone">{active.zone}</p>
              <h3>{active.title}</h3>
              <p className="status-line">{active.period} / {active.status}</p>
              <p>{active.summary}</p>
              <p>{active.details}</p>
            </div>

            <div className="chip-list" aria-label={`${active.title} stack`}>
              {active.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="evidence-list" aria-label={`${active.title} evidence`}>
              {active.proof.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="exhibit-links">
              {active.links.map((link) => {
                const LinkIcon = linkIcon(link.kind);
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    <LinkIcon size={16} aria-hidden="true" />
                    {link.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="cases-section" aria-labelledby="cases-title">
        <div className="section-heading">
          <p className="eyebrow">side rooms</p>
          <h2 id="cases-title">Early artifacts that still matter.</h2>
        </div>
        <div className="case-grid">
          {sideCases.map((item) => (
            <article className="case-item" key={item.title}>
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="case-links">
                {item.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    <link.icon size={15} aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline-section" id="timeline" aria-labelledby="timeline-title">
        <div className="section-heading">
          <p className="eyebrow">timeline</p>
          <h2 id="timeline-title">The path is very much not straight.</h2>
        </div>
        <div className="timeline-track">
          {timeline.map(([year, title, detail]) => (
            <article key={year}>
              <span>{year}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="experience-section"
        id="experience"
        aria-labelledby="experience-title"
      >
        <div className="section-heading">
          <p className="eyebrow">experience</p>
          <h2 id="experience-title">The work around the builds.</h2>
        </div>
        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="experience-row" key={`${item.company}-${item.role}`}>
              <div>
                <span>{item.date}</span>
                <h3>{item.company}</h3>
                <p>{item.role}</p>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="source-section" aria-labelledby="source-title">
        <div>
          <p className="eyebrow">source log</p>
          <h2 id="source-title">What this was built from.</h2>
        </div>
        <div className="source-list">
          {sourceLog.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">contact</p>
          <h2 id="contact-title">Best entry point: the public trail.</h2>
          <p>
            GitHub shows the code trail, LinkedIn shows the role trail, and email
            is there for everything that should not be a repository.
          </p>
        </div>
        <div className="contact-actions">
          <a href="mailto:jake@glickpeople.com">
            <Mail size={18} aria-hidden="true" />
            Email
          </a>
          <a href="https://github.com/JakeG12345" target="_blank" rel="noreferrer">
            <Code2 size={18} aria-hidden="true" />
            GitHub
          </a>
          <a
            href="https://au.linkedin.com/in/jake-glick-312a02284"
            target="_blank"
            rel="noreferrer"
          >
            <BriefcaseBusiness size={18} aria-hidden="true" />
            LinkedIn
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>Jake Glick portfolio museum</span>
        <span>Built from DOCX notes, public GitHub, live captures, and local project folders.</span>
      </footer>
    </main>
  );
}
