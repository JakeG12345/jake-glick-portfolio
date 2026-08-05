"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  Globe2,
  Landmark,
  Mail,
  Maximize2,
  MapPin,
  Minimize2,
  Search,
  Smartphone,
  Video,
  Waves,
  X,
} from "lucide-react";

type ProjectLink = {
  label: string;
  href: string;
  kind: "repo" | "live" | "video" | "store";
};

type ProjectTier = "flagship" | "built" | "artifact" | "learning";

type Project = {
  id: string;
  title: string;
  shortTitle: string;
  year: string;
  zone: string;
  category: string;
  tier: ProjectTier;
  status: string;
  summary: string;
  detail: string;
  stack: string[];
  proof: string[];
  source: string;
  image?: string;
  imageAlt?: string;
  color: string;
  x: number;
  z: number;
  height: number;
  links: ProjectLink[];
};

declare global {
  interface Window {
    __portfolioCityStatus?: () => {
      active: string;
      canvas: { height: number; width: number };
      nearby: string | null;
      objects: number;
      player: { x: number; z: number };
    };
  }
}

const contactLinks = [
  {
    label: "Email",
    href: "mailto:jake@glickpeople.com",
    Icon: Mail,
  },
  {
    label: "GitHub",
    href: "https://github.com/JakeG12345",
    Icon: Code2,
  },
  {
    label: "LinkedIn",
    href: "https://au.linkedin.com/in/jake-glick-312a02284",
    Icon: BriefcaseBusiness,
  },
];

const landmarkButtons = [
  {
    id: "sydney-harbour",
    label: "Opera House",
    Icon: Landmark,
  },
  {
    id: "bondi-beach",
    label: "Bondi",
    Icon: Waves,
  },
  {
    id: "dover-heights-home",
    label: "Dover Heights",
    Icon: MapPin,
  },
  {
    id: "quantium-work-experience",
    label: "Quantium",
    Icon: BriefcaseBusiness,
  },
  {
    id: "whatsapp-wrapped",
    label: "Blackbird",
    Icon: BriefcaseBusiness,
  },
];

const projects: Project[] = [
  {
    id: "whatsapp-wrapped",
    title: "WhatsAppWrapped",
    shortTitle: "Wrapped",
    year: "2026",
    zone: "Archive district",
    category: "Data story",
    tier: "flagship",
    status: "Blackbird camp build",
    summary:
      "A local-first WhatsApp export analyzer that turns messy chat history into a recap deck and a walkable museum.",
    detail:
      "The browser parses .txt and .zip exports locally, calculates stats, builds shareable cards, and avoids storing raw messages. It is the project that set the tone for this portfolio city.",
    stack: ["Next 16", "React 19", "TypeScript", "Anthropic", "Drizzle", "Better Auth"],
    proof: ["Public GitHub repo", "Local README privacy model", "Safe cover asset used"],
    source: "GitHub API and local README",
    image: "/projects/whatsapp-wrapped-cover.png",
    imageAlt: "WhatsAppWrapped recap cover screen",
    color: "#22d66f",
    x: -2,
    z: -7,
    height: 3.6,
    links: [
      { label: "GitHub", href: "https://github.com/JakeG12345/WhatsAppWrapped", kind: "repo" },
    ],
  },
  {
    id: "jashby",
    title: "Jashby",
    shortTitle: "Jashby",
    year: "2024-2026",
    zone: "Spreadsheet quarter",
    category: "Product",
    tier: "flagship",
    status: "Co-founder and CEO thread",
    summary:
      "A spreadsheet learning platform that turns Excel and Google Sheets skills into levels and daily challenges.",
    detail:
      "The local project stack includes the public Jashby app, Firebase-backed user flows, Univer Sheets workbooks, onboarding, subscriptions, analytics, and the Daily Excel challenge family.",
    stack: ["Next", "Firebase", "Univer Sheets", "TypeScript", "Vercel"],
    proof: ["jashby.com live", "Local Jashby folders", "Attached DOCX founder narrative"],
    source: "Attached DOCX, live site, local project folders",
    image: "/projects/jashby-product.png",
    imageAlt: "Jashby product artwork showing spreadsheet learning",
    color: "#18b96f",
    x: 4,
    z: -7,
    height: 4.2,
    links: [{ label: "Live site", href: "https://jashby.com", kind: "live" }],
  },
  {
    id: "daily-excel",
    title: "The Daily Excel",
    shortTitle: "Daily Excel",
    year: "2025",
    zone: "Spreadsheet quarter",
    category: "Puzzle",
    tier: "built",
    status: "Local product experiment",
    summary:
      "A Wordle-style daily spreadsheet puzzle with Sydney-time rotation, validation, and Univer workbook state.",
    detail:
      "The app defines puzzle scenarios, validates formulas and answers, and keeps the structure ready for streaks, history, analytics, and more levels.",
    stack: ["Next 14", "React 18", "TypeScript", "Univer Sheets"],
    proof: ["Local README", "Local thedailyexcel project"],
    source: "Local README and package metadata",
    image: "/projects/live-jashby.png",
    imageAlt: "Jashby live site screenshot used as spreadsheet-family branding",
    color: "#74c365",
    x: 7,
    z: -4,
    height: 2.4,
    links: [],
  },
  {
    id: "daily-challenge-app",
    title: "Daily Challenge App",
    shortTitle: "Daily App",
    year: "2025",
    zone: "Spreadsheet quarter",
    category: "Prototype",
    tier: "artifact",
    status: "Jashby local prototype",
    summary:
      "A separate Next/Univer daily challenge branch from the spreadsheet learning experiments.",
    detail:
      "This sits beside The Daily Excel and Jashby as a narrower test bed for challenge delivery and spreadsheet interaction.",
    stack: ["Next 15", "React 18", "Univer Sheets"],
    proof: ["Local package metadata", "Jashby folder scan"],
    source: "Local package metadata",
    color: "#9fd46d",
    x: 9.5,
    z: -1.5,
    height: 1.7,
    links: [],
  },
  {
    id: "car-lifestory-web",
    title: "Car Lifestory Web",
    shortTitle: "Car Web",
    year: "2026",
    zone: "Garage pier",
    category: "Product",
    tier: "flagship",
    status: "Live web app",
    summary:
      "A vehicle records app for ownership timelines, service history, costs, exports, and AI-assisted scan-to-form entry.",
    detail:
      "Built from a real need after getting Ps and digging through a 2002 Audi TT's paperwork. The web app handles auth, marketing, dashboard flows, pricing, and the extraction API.",
    stack: ["Next", "Supabase", "OpenAI API", "TypeScript", "Cloudflare path"],
    proof: ["carlifestory.vercel.app live", "Local web app README", "Attached DOCX motivation"],
    source: "Attached DOCX, live site, local project folder",
    image: "/projects/live-car-lifestory.png",
    imageAlt: "Car Lifestory live landing page screenshot",
    color: "#17bddd",
    x: 12,
    z: 2,
    height: 3.4,
    links: [{ label: "Live site", href: "https://carlifestory.vercel.app", kind: "live" }],
  },
  {
    id: "car-lifestory-mobile",
    title: "Car Lifestory Mobile",
    shortTitle: "Car App",
    year: "2026",
    zone: "Garage pier",
    category: "Mobile",
    tier: "built",
    status: "Expo app",
    summary:
      "The mobile companion for vehicle records, local persistence, Supabase groundwork, exports, and scan workflows.",
    detail:
      "The app side manages records, attachments, PDF and CSV export plumbing, deep links, and auth setup for the same car-history product.",
    stack: ["Expo", "React Native", "Supabase", "TypeScript"],
    proof: ["Local Expo project", "Local package metadata"],
    source: "Local app folder",
    image: "/projects/car-lifestory-timeline.png",
    imageAlt: "Car Lifestory app timeline screenshot",
    color: "#56c7e9",
    x: 15,
    z: 4.5,
    height: 2.3,
    links: [],
  },
  {
    id: "old-carstory",
    title: "OLD Carstory",
    shortTitle: "Old Car",
    year: "2026",
    zone: "Garage pier",
    category: "Prototype",
    tier: "artifact",
    status: "Earlier Expo prototype",
    summary:
      "An earlier car-records app branch with document picking, image picking, navigation, Zustand, and local storage.",
    detail:
      "This looks like the ancestor of Car Lifestory, useful because it shows the iteration path rather than just the polished version.",
    stack: ["Expo", "React Native", "Zustand", "Async Storage"],
    proof: ["Local package metadata", "OLD-carstory folder"],
    source: "Local package metadata",
    color: "#74d7ed",
    x: 15.5,
    z: 8,
    height: 1.6,
    links: [],
  },
  {
    id: "what-the-puck",
    title: "What The Puck",
    shortTitle: "Puck",
    year: "2022-2024",
    zone: "Stadium block",
    category: "Game",
    tier: "flagship",
    status: "Public mobile launch",
    summary:
      "A Unity mobile game crossing golf and ice hockey, launched on iOS and Android with AIgile.",
    detail:
      "Jake worked as lead developer across gameplay, frontend, and backend pieces. The App Store listing and live website make it the first big public launch in the archive.",
    stack: ["Unity", "C#", "iOS", "Android", "Mobile game systems"],
    proof: ["Live website screenshot", "App Store listing", "Attached DOCX launch story"],
    source: "Attached DOCX, live site, App Store link",
    image: "/projects/live-whatthepuck.png",
    imageAlt: "What The Puck live website screenshot",
    color: "#2787f0",
    x: -7,
    z: 8,
    height: 3.1,
    links: [
      { label: "Live site", href: "https://www.whatthepuck.app", kind: "live" },
      { label: "App Store", href: "https://apps.apple.com/us/app/what-the-puck/id6504596162", kind: "store" },
    ],
  },
  {
    id: "moriah-jiu-jitsu",
    title: "Moriah Jiu-Jitsu",
    shortTitle: "Jiu-Jitsu",
    year: "2025",
    zone: "School tools",
    category: "Ops tool",
    tier: "flagship",
    status: "Live school competition tool",
    summary:
      "A Firebase-backed site for athletes, divisions, competitions, scoring, and leaderboards.",
    detail:
      "Built for the coordinator of the Moriah Jiu-Jitsu program so live competition workflows could happen in one dedicated web app.",
    stack: ["Next 15", "React 19", "Firebase", "Tailwind", "Vercel"],
    proof: ["moriah-jiujitsu.vercel.app live", "Local project folder", "Attached DOCX link"],
    source: "Attached DOCX, live site, local folders",
    image: "/projects/live-moriah-jiujitsu.png",
    imageAlt: "Moriah Jiu-Jitsu live site screenshot",
    color: "#ff5b2e",
    x: -7,
    z: 1,
    height: 2.9,
    links: [{ label: "Live site", href: "https://moriah-jiujitsu.vercel.app/", kind: "live" }],
  },
  {
    id: "jiujitsu-prisma",
    title: "Jiu-Jitsu Prisma Prototype",
    shortTitle: "JJ Prisma",
    year: "2025",
    zone: "School tools",
    category: "Prototype",
    tier: "artifact",
    status: "Earlier local Next app",
    summary:
      "A separate Moriah Jiu-Jitsu branch with Prisma and Postgres setup before the Firebase version took shape.",
    detail:
      "Kept as an artifact because the stack shift tells the product story: data modelling first, then a simpler live workflow for school use.",
    stack: ["Next 15", "Prisma", "Postgres", "React 19"],
    proof: ["Local package metadata", "Local folder"],
    source: "Local package metadata",
    color: "#ff8b5e",
    x: -10,
    z: 3.5,
    height: 1.7,
    links: [],
  },
  {
    id: "degree6",
    title: "Degree6",
    shortTitle: "Degree6",
    year: "2025",
    zone: "Network lane",
    category: "Data viz",
    tier: "flagship",
    status: "Locally run for screenshot",
    summary:
      "A D3-powered LinkedIn network explorer for degrees of separation, search, filtering, and graph navigation.",
    detail:
      "The local app runs a Vite React client and Express backend. It was started locally for a real screenshot of the graph interface.",
    stack: ["React", "D3", "Vite", "Express", "TypeScript"],
    proof: ["Local server run", "Screenshot captured from localhost", "Public repo found"],
    source: "Local README, local run, GitHub API",
    image: "/projects/degree6-live.png",
    imageAlt: "Degree6 network graph screenshot",
    color: "#7c5cff",
    x: 2,
    z: 8.5,
    height: 3.2,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/degree6", kind: "repo" }],
  },
  {
    id: "hsc-mc-maker",
    title: "HSC MC Maker",
    shortTitle: "HSC MC",
    year: "2025",
    zone: "School tools",
    category: "Study app",
    tier: "built",
    status: "Expo study app",
    summary:
      "A React Native app for making and practising HSC multiple-choice questions with fast entry and answer-key fixes.",
    detail:
      "The current local Expo project has config and README but no bundled screenshots, so the city uses a custom study-lab sign instead of a fake capture.",
    stack: ["Expo SDK 54", "React Native", "TypeScript"],
    proof: ["Local README", "Expo app config", "Collaborator repo link"],
    source: "Local README and app config",
    color: "#f2b84b",
    x: -12,
    z: 0,
    height: 2,
    links: [{ label: "GitHub", href: "https://github.com/Josephmosh/hsc-mc-maker", kind: "repo" }],
  },
  {
    id: "idea-aid",
    title: "Idea Aid",
    shortTitle: "Idea Aid",
    year: "2023",
    zone: "AI workshop",
    category: "AI app",
    tier: "built",
    status: "CS50 final project",
    summary:
      "A Flask idea generator built with friends for CS50, using SQL, Bootstrap, and the OpenAI API.",
    detail:
      "This is the early AI-app marker: a practical app, a course final, and one of the first bridges from web dev into LLM-powered software.",
    stack: ["Flask", "Python", "SQL", "Bootstrap", "OpenAI API"],
    proof: ["Public repo", "Submission video", "Attached DOCX"],
    source: "GitHub API, attached DOCX, YouTube link",
    color: "#b86dff",
    x: 0,
    z: 3.5,
    height: 2.1,
    links: [
      { label: "GitHub", href: "https://github.com/JakeG12345/idea-aid", kind: "repo" },
      { label: "Submission video", href: "https://www.youtube.com/watch?v=BXPvE4tj9BQ", kind: "video" },
    ],
  },
  {
    id: "decentralised-twitter",
    title: "Decentralised Twitter",
    shortTitle: "Web3 Twitter",
    year: "2022",
    zone: "Web3 arcade",
    category: "Hackathon",
    tier: "artifact",
    status: "Polygon BUIDL IT entry",
    summary:
      "A Twitter-like app where data lived on Polygon, built during the 2022 Web3/NFT/Crypto phase.",
    detail:
      "The video submission is the evidence trail. It belongs in the city as the blockchain experiment that happened before the later product work.",
    stack: ["React", "Polygon", "Moralis", "Smart contracts"],
    proof: ["Attached DOCX", "Submission video"],
    source: "Attached DOCX and YouTube link",
    color: "#8247e5",
    x: -3.8,
    z: 4.5,
    height: 1.8,
    links: [{ label: "Submission video", href: "https://www.youtube.com/watch?v=-SOcDpY46Us", kind: "video" }],
  },
  {
    id: "pragma",
    title: "Pragma",
    shortTitle: "Pragma",
    year: "2022",
    zone: "Web strip",
    category: "Website",
    tier: "artifact",
    status: "Live early web build",
    summary:
      "An early HTML-era public site under Pragmatic Minds / NexGen styling.",
    detail:
      "Not the flagship anymore, but a useful timestamp from the phase where HTML, CSS, JavaScript, and React started becoming serious tools.",
    stack: ["HTML", "CSS", "JavaScript"],
    proof: ["Public repo", "Live Vercel site"],
    source: "GitHub API and live site capture",
    image: "/projects/live-pragma.png",
    imageAlt: "Pragma live site screenshot",
    color: "#e1b543",
    x: -13,
    z: -5,
    height: 1.9,
    links: [
      { label: "Live site", href: "https://pragma-three.vercel.app", kind: "live" },
      { label: "GitHub", href: "https://github.com/JakeG12345/pragma", kind: "repo" },
    ],
  },
  {
    id: "the-internet",
    title: "The Internet",
    shortTitle: "Internet",
    year: "2023",
    zone: "Web strip",
    category: "Website",
    tier: "artifact",
    status: "Public GitHub repo",
    summary:
      "A public HTML repo from the web learning phase.",
    detail:
      "The repo sits between the first public web experiments and the later Next/Firebase product projects.",
    stack: ["HTML", "CSS"],
    proof: ["Public GitHub repo"],
    source: "GitHub API",
    color: "#c95037",
    x: -15,
    z: -2.5,
    height: 1.5,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/The-Internet", kind: "repo" }],
  },
  {
    id: "portfolio",
    title: "Jake Glick Portfolio",
    shortTitle: "Portfolio",
    year: "2026",
    zone: "City hall",
    category: "Portfolio",
    tier: "built",
    status: "This site",
    summary:
      "The portfolio itself, now a 3D city with project branding, contact access, and a complete archive.",
    detail:
      "Built from the attached DOCX, public GitHub metadata, live captures, and local folders, with private chat content deliberately kept out.",
    stack: ["Next 16", "React 19", "Three.js", "TypeScript"],
    proof: ["Local branch", "Production build verified"],
    source: "Local repository",
    color: "#f7d35f",
    x: 2,
    z: -1,
    height: 2.5,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/jake-glick-portfolio", kind: "repo" }],
  },
  {
    id: "simplesheets",
    title: "SimpleSheets",
    shortTitle: "SimpleSheets",
    year: "2024",
    zone: "Flutter row",
    category: "Mobile",
    tier: "artifact",
    status: "Flutter local project",
    summary:
      "A Flutter spreadsheet-adjacent project using shared preferences and conversion utilities.",
    detail:
      "A smaller mobile experiment that connects naturally to the later spreadsheet-learning theme.",
    stack: ["Flutter", "Dart", "Shared Preferences"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#3fb6ff",
    x: 7,
    z: 4.5,
    height: 1.5,
    links: [],
  },
  {
    id: "dungeon-game",
    title: "Dungeon Game",
    shortTitle: "Dungeon",
    year: "2025",
    zone: "Game cave",
    category: "Game",
    tier: "built",
    status: "Python/Pygame school project",
    summary:
      "A 2D dungeon exploration game with character classes, enemies, traps, chests, portals, tests, and procedural levels.",
    detail:
      "The README shows a real object-oriented Pygame codebase with core, character, object, UI, utils, assets, and tests packages.",
    stack: ["Python", "Pygame", "NumPy", "OOP", "Tests"],
    proof: ["Local README", "TKS Software Y11 folder"],
    source: "Local README",
    color: "#6d5235",
    x: -4,
    z: 11.5,
    height: 2,
    links: [],
  },
  {
    id: "deaf-emergency-app",
    title: "Deaf Emergency App",
    shortTitle: "Emergency",
    year: "2024",
    zone: "Flutter row",
    category: "Mobile",
    tier: "artifact",
    status: "Flutter school app",
    summary:
      "A Flutter app from the IST 2024 folder with HTTP, internationalisation, and loading states.",
    detail:
      "The name and dependencies point to an emergency-oriented mobile build from the school Flutter phase.",
    stack: ["Flutter", "Dart", "HTTP", "Intl"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#ff715b",
    x: 9.5,
    z: 7,
    height: 1.6,
    links: [],
  },
  {
    id: "world-time",
    title: "World Time",
    shortTitle: "World Time",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Flutter tutorial app",
    summary:
      "A Flutter world time app using HTTP, internationalisation, and loading indicators.",
    detail:
      "A clean timestamp from the mobile learning phase, visible locally and mirrored by the public tutorial-style repo set.",
    stack: ["Flutter", "Dart", "HTTP", "Intl"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#4f8bd8",
    x: 11.5,
    z: 9,
    height: 1.2,
    links: [],
  },
  {
    id: "tip-calculator",
    title: "Tip Calculator",
    shortTitle: "Tips",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Flutter utility",
    summary:
      "A small Flutter calculator using intl, likely from the IST mobile app run.",
    detail:
      "A simple utility build that belongs in the archive as part of the repetition that made later app work easier.",
    stack: ["Flutter", "Dart", "Intl"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#5dbb88",
    x: 13.5,
    z: 10.8,
    height: 1.2,
    links: [],
  },
  {
    id: "quotes",
    title: "Quotes",
    shortTitle: "Quotes",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Public Flutter tutorial repo",
    summary:
      "A Flutter quote app from a tutorial series.",
    detail:
      "The repo description links directly to the tutorial playlist, making it useful as an honest learning artifact.",
    stack: ["Flutter", "Dart"],
    proof: ["Public GitHub repo", "Local Flutter folder"],
    source: "GitHub API and local pubspec",
    color: "#7bbf50",
    x: 6.5,
    z: 9.5,
    height: 1.15,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/quotes", kind: "repo" }],
  },
  {
    id: "ninja-id",
    title: "Ninja ID",
    shortTitle: "Ninja ID",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Public Flutter tutorial repo",
    summary:
      "A small Flutter identity-card app from the mobile tutorial period.",
    detail:
      "Another small, visible build from the Flutter learning streak.",
    stack: ["Flutter", "Dart"],
    proof: ["Public GitHub repo", "Local Flutter folder"],
    source: "GitHub API and local pubspec",
    color: "#6262d9",
    x: 4.5,
    z: 11.5,
    height: 1.1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/ninja_id", kind: "repo" }],
  },
  {
    id: "flutter-tutorial-p1",
    title: "Flutter Tutorial P1",
    shortTitle: "Flutter P1",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Public Flutter tutorial repo",
    summary:
      "The public starting point from the Flutter tutorial sequence.",
    detail:
      "Small by itself, but useful in the full archive because it marks the move from web and Swift into Flutter.",
    stack: ["Flutter", "Dart"],
    proof: ["Public GitHub repo", "Local Flutter folder"],
    source: "GitHub API and local pubspec",
    color: "#3b98f0",
    x: 2.5,
    z: 13,
    height: 1.1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/flutter-tutorial-p1", kind: "repo" }],
  },
  {
    id: "dice-app",
    title: "Dice App",
    shortTitle: "Dice",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Flutter local app",
    summary:
      "A small Flutter dice app from the IST 2024 folder.",
    detail:
      "A classic tutorial-scale mobile build, included because the archive should show the full run of practice projects.",
    stack: ["Flutter", "Dart"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#d8634b",
    x: 0,
    z: 13.5,
    height: 1,
    links: [],
  },
  {
    id: "message-app",
    title: "Message App",
    shortTitle: "Message",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Flutter local app",
    summary:
      "A small Flutter messaging-style app from the IST 2024 folder.",
    detail:
      "Another artifact from the mobile UI learning period.",
    stack: ["Flutter", "Dart"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#2fc18b",
    x: -2.5,
    z: 13,
    height: 1,
    links: [],
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    shortTitle: "TicTacToe",
    year: "2024",
    zone: "Flutter row",
    category: "Game",
    tier: "learning",
    status: "Flutter local game",
    summary:
      "A small Flutter tic-tac-toe game from the IST 2024 folder.",
    detail:
      "A compact game-logic artifact from the same mobile learning block.",
    stack: ["Flutter", "Dart", "Game logic"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#f4a340",
    x: -5,
    z: 13,
    height: 1,
    links: [],
  },
  {
    id: "quiz-3",
    title: "Quiz 3",
    shortTitle: "Quiz",
    year: "2024",
    zone: "Flutter row",
    category: "Tutorial",
    tier: "learning",
    status: "Flutter local quiz app",
    summary:
      "A small Flutter quiz app from the IST 2024 folder.",
    detail:
      "Paired with the later 3RD SENSE quiz-app work as a small learning artifact.",
    stack: ["Flutter", "Dart"],
    proof: ["Local pubspec metadata"],
    source: "Local Flutter folder",
    color: "#c86dd7",
    x: -7.5,
    z: 12,
    height: 1,
    links: [],
  },
  {
    id: "atari-breakout",
    title: "Atari Breakout",
    shortTitle: "Breakout",
    year: "2021",
    zone: "Swift arcade",
    category: "Game",
    tier: "learning",
    status: "Public Swift repo",
    summary:
      "An early Swift/Xcode arcade game from the iOS learning phase.",
    detail:
      "Part of the 2021 game trio that came after Arduino and before web development.",
    stack: ["Swift", "Xcode", "iOS"],
    proof: ["Public GitHub repo", "Attached DOCX early project list"],
    source: "GitHub API and attached DOCX",
    color: "#f06c64",
    x: -14,
    z: 8.5,
    height: 1.25,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/Atari-Breakout", kind: "repo" }],
  },
  {
    id: "space-invaders",
    title: "Space Invaders",
    shortTitle: "Invaders",
    year: "2021",
    zone: "Swift arcade",
    category: "Game",
    tier: "learning",
    status: "Public Swift repo",
    summary:
      "An early Swift/Xcode Space Invaders build.",
    detail:
      "Another direct marker of the first iOS game-dev phase.",
    stack: ["Swift", "Xcode", "iOS"],
    proof: ["Public GitHub repo", "Attached DOCX early project list"],
    source: "GitHub API and attached DOCX",
    color: "#4ba3ff",
    x: -16,
    z: 6,
    height: 1.25,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/Space-Invaders", kind: "repo" }],
  },
  {
    id: "helicopter-arcade",
    title: "Helicopter Arcade Game",
    shortTitle: "Helicopter",
    year: "2021",
    zone: "Swift arcade",
    category: "Game",
    tier: "learning",
    status: "Public Swift repo",
    summary:
      "An early Swift/Xcode helicopter arcade game.",
    detail:
      "Completes the 2021 arcade trio, included as a smaller sign on the old arcade side of the city.",
    stack: ["Swift", "Xcode", "iOS"],
    proof: ["Public GitHub repo", "Attached DOCX early project list"],
    source: "GitHub API and attached DOCX",
    color: "#8cbf3f",
    x: -17,
    z: 3.3,
    height: 1.2,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/Helicopter-arcade-game", kind: "repo" }],
  },
  {
    id: "learning-gh",
    title: "LearningGH",
    shortTitle: "LearningGH",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public Swift repo",
    summary:
      "A CodeWithChris foundation course repo from the first GitHub learning period.",
    detail:
      "Included because it is literally the root of the public GitHub trail.",
    stack: ["GitHub", "Swift"],
    proof: ["Public GitHub repo created April 4, 2021"],
    source: "GitHub API",
    color: "#878d96",
    x: -17,
    z: -0.5,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/LearningGH", kind: "repo" }],
  },
  {
    id: "learning-gh-dash",
    title: "Learning-GH",
    shortTitle: "Learning-GH",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public GitHub repo",
    summary:
      "A second CodeWithChris GitHub-learning repo from the same day.",
    detail:
      "A small foundation artifact, intentionally treated as a plaque rather than a flagship.",
    stack: ["GitHub"],
    proof: ["Public GitHub repo created April 4, 2021"],
    source: "GitHub API",
    color: "#767b84",
    x: -15.8,
    z: -7,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/Learning-GH", kind: "repo" }],
  },
  {
    id: "learning-gh-attempt2",
    title: "Learning GH Attempt2",
    shortTitle: "GH Attempt2",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public Swift repo",
    summary:
      "Another CodeWithChris Git/GitHub learning repo.",
    detail:
      "A small signpost from the public repo timeline.",
    stack: ["GitHub", "Swift"],
    proof: ["Public GitHub repo"],
    source: "GitHub API",
    color: "#989da5",
    x: -13.2,
    z: -8.8,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/Learning-GH-Attempt2", kind: "repo" }],
  },
  {
    id: "swiftui-foundations-data",
    title: "SwiftUI Foundations Data",
    shortTitle: "SwiftUI Data",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public GitHub repo",
    summary:
      "A SwiftUI foundations wrap-up data repo from the CodeWithChris learning track.",
    detail:
      "Kept as part of the complete public GitHub inventory.",
    stack: ["SwiftUI", "Data"],
    proof: ["Public GitHub repo"],
    source: "GitHub API",
    color: "#aab0b8",
    x: -10.5,
    z: -10,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/data-for-swiftui-foundations-m5-wrapup", kind: "repo" }],
  },
  {
    id: "learningapp-data",
    title: "learningapp-data",
    shortTitle: "Learn Data",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public GitHub repo",
    summary:
      "A data repo from the early Swift learning app material.",
    detail:
      "A small repository, but part of the all-project trail.",
    stack: ["Swift learning", "Data"],
    proof: ["Public GitHub repo"],
    source: "GitHub API",
    color: "#bfc4cb",
    x: -8,
    z: -10.7,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/learningapp-data", kind: "repo" }],
  },
  {
    id: "m5l6-challenge",
    title: "M5L6 Challenge Video",
    shortTitle: "M5L6",
    year: "2021",
    zone: "Git foundations",
    category: "Learning",
    tier: "learning",
    status: "Public GitHub repo",
    summary:
      "A CodeWithChris module challenge artifact from the 2021 Swift/GitHub run.",
    detail:
      "Another small plaque from the first public code trail.",
    stack: ["Swift learning"],
    proof: ["Public GitHub repo"],
    source: "GitHub API",
    color: "#d0d4da",
    x: -5.2,
    z: -10.5,
    height: 1,
    links: [{ label: "GitHub", href: "https://github.com/JakeG12345/M5L6challengevideo", kind: "repo" }],
  },
  {
    id: "competitive-programming-archive",
    title: "Competitive Programming Archive",
    shortTitle: "ProgComp",
    year: "2024-2026",
    zone: "Algorithm training ground",
    category: "Learning",
    tier: "learning",
    status: "Local practice archive",
    summary:
      "A local archive of programming competition attempts, input/output files, templates, and finals practice.",
    detail:
      "The folder covers ProgComp practice across older finals, 2024/2025 material, and 2026 preparation. It belongs in the city as the problem-solving gym behind the product work.",
    stack: ["Python", "Algorithms", "I/O files", "Templates"],
    proof: ["Local ProgComp folders", "2026 practice scripts", "Finals material"],
    source: "Local folder scan",
    color: "#4c8ecf",
    x: -18.5,
    z: -4.2,
    height: 1.25,
    links: [],
  },
  {
    id: "cpp-aio-prep",
    title: "C++ and AIO Prep",
    shortTitle: "C++ AIO",
    year: "2025-2026",
    zone: "Algorithm training ground",
    category: "Learning",
    tier: "learning",
    status: "Local study archive",
    summary:
      "A C++ preparation folder with competitive programming references, tutorial exercises, templates, and AIO material.",
    detail:
      "This is less a polished app and more a serious practice trail: C++ templates, sample programs, programming contest books, and Australian Informatics Olympiad preparation material.",
    stack: ["C++", "AIO", "Competitive programming"],
    proof: ["Local C++ & AIO Prep folder", "Template and tutorial files"],
    source: "Local folder scan",
    color: "#d6b53e",
    x: -20.2,
    z: -6.4,
    height: 1.15,
    links: [],
  },
  {
    id: "python-ist-practice",
    title: "Python and IST Practice",
    shortTitle: "Python IST",
    year: "2024",
    zone: "School code lane",
    category: "Learning",
    tier: "learning",
    status: "Local classwork archive",
    summary:
      "Python practice and IST 2024 exercises from the school coding trail.",
    detail:
      "Small files, but useful context: this is where simple Python exercises, class challenges, and competition-adjacent practice sit beside the larger builds.",
    stack: ["Python", "School projects"],
    proof: ["Local Python folder", "IST 2024 challenge file"],
    source: "Local folder scan",
    color: "#8ab6d8",
    x: -18.8,
    z: -8.6,
    height: 1.05,
    links: [],
  },
  {
    id: "quant-trading-bot",
    title: "Quant Trading Bot",
    shortTitle: "Quant Bot",
    year: "2026",
    zone: "Data pier",
    category: "Data story",
    tier: "artifact",
    status: "Local finance experiment",
    summary:
      "A local Python finance experiment with AAPL equity data, generated trades, and simple moving-average trading bot scripts.",
    detail:
      "This is a compact local project rather than a product, but it adds an important interest signal: data, markets, automation, and turning raw CSVs into decisions.",
    stack: ["Python", "CSV", "Trading logic", "SMA"],
    proof: ["Local quant folder", "AAPL equity and trades CSVs"],
    source: "Local folder scan",
    color: "#62c2a8",
    x: -16.5,
    z: -10.6,
    height: 1.35,
    links: [],
  },
  {
    id: "room-accessory",
    title: "Room Accessory",
    shortTitle: "Room",
    year: "2025",
    zone: "Scratch block",
    category: "Prototype",
    tier: "learning",
    status: "Next starter repo",
    summary:
      "A local Next app that still appears to be at starter-template stage.",
    detail:
      "Included as a small scratch-block plaque because it exists locally, but it is not oversold as a shipped project.",
    stack: ["Next 15", "React 19"],
    proof: ["Local README", "Local page source"],
    source: "Local folder",
    color: "#c7a56a",
    x: 12.5,
    z: -7,
    height: 1,
    links: [],
  },
];

const projectById = new Map(projects.map((project) => [project.id, project]));

function featuredProject(id: string, overrides: Partial<Project>): Project {
  const project = projectById.get(id);
  if (!project) throw new Error(`Missing featured project: ${id}`);
  return { ...project, ...overrides };
}

const cityItems: Project[] = [
  featuredProject("whatsapp-wrapped", {
    title: "Blackbird / WhatsAppWrapped",
    shortTitle: "Blackbird",
    zone: "Blackbird startup block",
    status: "Blackbird camp build",
    detail:
      "WhatsAppWrapped sits in the Blackbird block because that camp is where the museum-style idea became a real product surface: local parsing, recap cards, and the first archive walk.",
    proof: ["Blackbird camp build", "Public GitHub repo", "Local README privacy model"],
    color: "#22d66f",
    x: 1.6,
    z: -5.6,
    height: 4.1,
  }),
  featuredProject("jashby", {
    zone: "Spreadsheet campus",
    detail:
      "Jashby gets the spreadsheet campus: the long-running founder thread around turning Excel and Google Sheets learning into levels, daily challenges, onboarding, analytics, and real user loops.",
    x: 3.9,
    z: -1.2,
    height: 4.2,
  }),
  {
    id: "quantium-work-experience",
    title: "Quantium Work Experience",
    shortTitle: "Quantium",
    year: "2024",
    zone: "CBD data tower",
    category: "Experience",
    tier: "built",
    status: "Work experience",
    summary:
      "A CBD data tower for the Quantium work-experience week around CommBank iQ analytics and market-data scraping.",
    detail:
      "This is mapped as a city workplace rather than a repo. It anchors the analytics side of the portfolio: client data, market signals, and a scraper built in a professional context.",
    stack: ["Data analytics", "Web scraping", "CommBank iQ context"],
    proof: ["Attached DOCX role notes", "Experience entry"],
    source: "Attached DOCX",
    color: "#2f8ec7",
    x: -1.3,
    z: -5.3,
    height: 4,
    links: [],
  },
  {
    id: "dover-heights-home",
    title: "Dover Heights Home Base",
    shortTitle: "Dover",
    year: "Sydney",
    zone: "Dover Heights cliff",
    category: "Landmark",
    tier: "artifact",
    status: "Home base near Bondi",
    summary:
      "The map's home point: Dover Heights, up on the coast near Bondi Beach.",
    detail:
      "This gives the portfolio city a personal origin instead of floating in generic tech-land. It sits above the beach and looks back toward the project blocks.",
    stack: ["Sydney", "Dover Heights", "Coast", "Home base"],
    proof: ["User-provided location context"],
    source: "User request",
    color: "#f0c36a",
    x: 10.9,
    z: 1.4,
    height: 1.45,
    links: [],
  },
  {
    id: "bondi-beach",
    title: "Bondi Beach",
    shortTitle: "Bondi",
    year: "Sydney",
    zone: "Eastern suburbs coast",
    category: "Landmark",
    tier: "artifact",
    status: "Beach landmark",
    summary:
      "A bright coastal strip for the beach part of the world: sand, surf, boards, and the city edge.",
    detail:
      "Bondi is treated as landscape, not decoration. It gives the mini city a real east-Sydney coastline and a natural place for the Dover Heights home marker.",
    stack: ["Beach", "Surf", "Eastern suburbs"],
    proof: ["User-requested landmark"],
    source: "User request",
    color: "#4cbad8",
    x: 13.5,
    z: 4.4,
    height: 1.2,
    links: [],
  },
  {
    id: "sydney-harbour",
    title: "Sydney Harbour / Opera House",
    shortTitle: "Opera House",
    year: "Sydney",
    zone: "Harbour landmark",
    category: "Landmark",
    tier: "artifact",
    status: "Sydney landmark cluster",
    summary:
      "The harbour corner with Opera House-style sails, a bridge arch, and CBD skyline massing.",
    detail:
      "This anchors the map in Sydney before the project buildings take over. It is deliberately literal: water, sails, bridge, skyline.",
    stack: ["Opera House", "Harbour Bridge", "CBD"],
    proof: ["User-requested landmark"],
    source: "User request",
    color: "#fff1bf",
    x: -5.6,
    z: -8.5,
    height: 1.8,
    links: [],
  },
  featuredProject("car-lifestory-web", {
    title: "Dover Garage / Car Lifestory",
    shortTitle: "Car Story",
    zone: "Dover garage",
    detail:
      "Car Lifestory sits by the Dover Heights home marker because the product starts from a real car-history problem: ownership paperwork, service records, costs, exports, and scan-to-form entry.",
    x: 10.5,
    z: 2.9,
    height: 2.5,
  }),
  featuredProject("what-the-puck", {
    zone: "Sports field",
    detail:
      "What The Puck sits beside the football pitch as the public-game landmark: Unity, C#, mobile launch work, and the first project here that shipped to app stores.",
    x: 5.4,
    z: 9.1,
    height: 2.9,
  }),
  featuredProject("moriah-jiu-jitsu", {
    zone: "School sports block",
    detail:
      "The Moriah Jiu-Jitsu tool is placed near the sports side of the city because it is an operational school-sport system: divisions, athletes, scoring, leaderboards, and live competition admin.",
    x: 7.4,
    z: 6.6,
    height: 2.6,
  }),
  featuredProject("degree6", {
    zone: "Network interchange",
    detail:
      "Degree6 becomes the network interchange: a D3 graph tool for searching and exploring degrees of separation through LinkedIn-style relationship data.",
    x: 4.4,
    z: -4.7,
    height: 3.1,
  }),
  featuredProject("idea-aid", {
    zone: "AI workshop",
    detail:
      "Idea Aid stays as the early AI workshop: a CS50 Flask app where prompts, SQL, auth, Bootstrap, and the OpenAI API first became an actual user-facing generator.",
    x: 6.5,
    z: 1.3,
    height: 2.2,
  }),
  featuredProject("portfolio", {
    zone: "City hall",
    detail:
      "The portfolio itself is the city hall: a live map of the work, the Sydney context, the contact route, and the archive underneath it.",
    x: 0.5,
    z: -1.6,
    height: 2.3,
  }),
];

const cityItemIds = new Set(cityItems.map((item) => item.id));
const selectableItems = [
  ...cityItems,
  ...projects.filter((project) => !cityItemIds.has(project.id)),
];

const experiences = [
  {
    role: "Co-Founder",
    company: "Jashby",
    date: "Nov 2024 - Present",
    detail:
      "Building a gamified spreadsheet learning platform while still balancing school, product decisions, and the pull of real users.",
  },
  {
    role: "Game Developer",
    company: "AIgile",
    date: "Sep 2022 - Dec 2024",
    detail:
      "Lead developer on What The Puck across gameplay, frontend, and backend pieces for a public mobile launch.",
  },
  {
    role: "Work Experience",
    company: "Quantium",
    date: "Jul 2024",
    detail:
      "Worked around CommBank iQ data analytics and built a web scraper for client-market data.",
  },
  {
    role: "System Architect",
    company: "Breeze Wholesale Marketplace",
    date: "Jun 2023 - Jul 2023",
    detail:
      "Scoped a wholesale marketplace for a startup founder, including technical approach, timeline, and rough costs.",
  },
  {
    role: "Game Developer",
    company: "3RD SENSE",
    date: "Apr 2023 - Jun 2023",
    detail:
      "Worked on a Unity quiz app, integrating API data and turning supplied designs into mobile UI.",
  },
];

const cityStats = [
  ["18", "public GitHub repos"],
  [String(cityItems.length), "map stops"],
  [String(projects.length), "archive items"],
  ["2026", "Moriah College grad"],
];

const filters = ["All", "Product", "Game", "Mobile", "Data story", "Learning"] as const;

function linkIcon(kind: ProjectLink["kind"]) {
  if (kind === "repo") return Code2;
  if (kind === "video") return Video;
  if (kind === "store") return Smartphone;
  return Globe2;
}

function tierLabel(tier: ProjectTier) {
  if (tier === "flagship") return "Flagship";
  if (tier === "built") return "Built";
  if (tier === "artifact") return "Artifact";
  return "Learning";
}

function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  draw(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function projectTexture(project: Project) {
  return createCanvasTexture(1024, 640, (ctx) => {
    ctx.fillStyle = "#101611";
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = project.color;
    ctx.fillRect(0, 0, 1024, 18);
    ctx.fillRect(0, 590, 1024, 50);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    for (let x = 0; x < 1024; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 72) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#fff7df";
    ctx.font = "900 74px Arial";
    wrapCanvasText(ctx, project.shortTitle, 80, 230, 860, 78);
    ctx.font = "700 34px Arial";
    ctx.fillStyle = project.color;
    ctx.fillText(project.category.toUpperCase(), 82, 104);
    ctx.font = "600 28px Arial";
    ctx.fillStyle = "#d8d2bd";
    wrapCanvasText(ctx, project.summary, 84, 342, 820, 38);
  });
}

function labelTexture(project: Project) {
  return createCanvasTexture(768, 256, (ctx) => {
    ctx.fillStyle = "rgba(255,253,244,0.94)";
    ctx.fillRect(0, 0, 768, 256);
    ctx.strokeStyle = "#151713";
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 752, 240);
    ctx.fillStyle = project.color;
    ctx.fillRect(28, 28, 126, 200);
    ctx.fillStyle = "#151713";
    ctx.font = "900 42px Arial";
    ctx.fillText(project.year, 180, 78);
    ctx.font = "900 54px Arial";
    wrapCanvasText(ctx, project.shortTitle, 180, 148, 530, 58);
    ctx.font = "700 26px Arial";
    ctx.fillStyle = "#485048";
    ctx.fillText(tierLabel(project.tier).toUpperCase(), 180, 218);
  });
}

function patternTexture(kind: "grass" | "sand" | "water" | "road" | "pitch") {
  return createCanvasTexture(512, 512, (ctx) => {
    if (kind === "grass") {
      ctx.fillStyle = "#4f8d55";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 512; i += 34) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 96, 512);
        ctx.stroke();
      }
      return;
    }
    if (kind === "sand") {
      ctx.fillStyle = "#e4c875";
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 900; i += 1) {
        ctx.fillStyle = i % 2 ? "rgba(126,91,41,0.16)" : "rgba(255,252,221,0.18)";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
      return;
    }
    if (kind === "water") {
      ctx.fillStyle = "#176b82";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "rgba(175,229,238,0.32)";
      ctx.lineWidth = 5;
      for (let y = 36; y < 512; y += 58) {
        ctx.beginPath();
        for (let x = 0; x <= 512; x += 12) {
          ctx.lineTo(x, y + Math.sin(x / 26) * 9);
        }
        ctx.stroke();
      }
      return;
    }
    if (kind === "pitch") {
      ctx.fillStyle = "#2c8d4a";
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let x = 0; x < 512; x += 72) ctx.fillRect(x, 0, 34, 512);
      return;
    }
    ctx.fillStyle = "#2c302b";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let y = 0; y < 512; y += 52) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY);
}

function modelMaterial(color: string, parameters: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.58,
    metalness: 0.04,
    ...parameters,
  });
}

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  materialOrColor: THREE.Material | string,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  materialParameters: THREE.MeshStandardMaterialParameters = {},
) {
  const material =
    typeof materialOrColor === "string" ? modelMaterial(materialOrColor, materialParameters) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  materialOrColor: THREE.Material | string,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  segments = 24,
) {
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  parent.add(mesh);
  return mesh;
}

function addCone(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  segments: number,
  materialOrColor: THREE.Material | string,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
) {
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, segments), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  parent.add(mesh);
  return mesh;
}

function addSphere(
  parent: THREE.Object3D,
  radius: number,
  materialOrColor: THREE.Material | string,
  position: [number, number, number],
  segments = 24,
) {
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(12, Math.floor(segments / 2))), material);
  mesh.position.set(position[0], position[1], position[2]);
  parent.add(mesh);
  return mesh;
}

function addCylinderBetween(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  materialOrColor: THREE.Material | string,
) {
  const direction = end.clone().sub(start);
  const length = direction.length();
  if (length <= 0.001) return undefined;
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), material);
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  parent.add(mesh);
  return mesh;
}

function addFacadeGrid(
  parent: THREE.Object3D,
  width: number,
  height: number,
  depth: number,
  rows: number,
  columns: number,
  color = "#fff8dc",
  yMin = 0.55,
) {
  const material = new THREE.MeshBasicMaterial({ color });
  const cellWidth = Math.min(0.22, width / (columns * 1.75));
  const cellHeight = Math.min(0.22, height / (rows * 2.05));
  const usableHeight = Math.max(0.4, height - yMin - 0.38);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = -width / 2 + ((column + 1) * width) / (columns + 1);
      const y = yMin + (rows === 1 ? 0 : (row * usableHeight) / (rows - 1));
      [-depth / 2 - 0.02, depth / 2 + 0.02].forEach((z) => {
        addBox(parent, [cellWidth, cellHeight, 0.026], material, [x, y, z]);
      });
    }
  }
}

function createProjectModel(project: Project) {
  if (project.id === "whatsapp-wrapped") return createWhatsAppWrappedModel(project);
  if (project.id === "jashby") return createJashbyModel(project);
  if (project.id === "quantium-work-experience") return createQuantiumModel(project);
  if (project.id === "degree6") return createDegree6Model(project);
  if (project.id === "car-lifestory-web") return createGarageModel(project);
  if (project.id === "what-the-puck") return createPuckModel(project);
  if (project.id === "moriah-jiu-jitsu") return createDojoModel(project);
  if (project.id === "idea-aid") return createIdeaAidModel(project);
  if (project.id === "portfolio") return createCityHallModel(project);
  if (project.id === "sydney-harbour") return createHarbourModel(project);
  if (project.id === "bondi-beach") return createBondiModel(project);
  if (project.id === "dover-heights-home") return createDoverHomeModel(project);
  return createGenericProjectTower(project);
}

function createGenericProjectTower(project: Project) {
  const group = new THREE.Group();
  const width = project.tier === "flagship" ? 1.85 : 1.45;
  const depth = project.tier === "flagship" ? 1.55 : 1.22;
  addBox(group, [width, project.height, depth], project.color, [0, project.height / 2, 0], [0, 0, 0], {
    metalness: project.tier === "flagship" ? 0.14 : 0.04,
  });
  addBox(group, [width + 0.24, 0.16, depth + 0.24], "#fff8dc", [0, project.height + 0.08, 0]);
  addFacadeGrid(group, width, project.height, depth, project.tier === "flagship" ? 7 : 4, 3, "#fff8dc");
  return group;
}

function createWhatsAppWrappedModel(project: Project) {
  const group = new THREE.Group();
  const dark = modelMaterial("#101611", { roughness: 0.38, metalness: 0.16 });
  const green = modelMaterial(project.color, { roughness: 0.36, metalness: 0.08 });
  addBox(group, [1.9, project.height, 1.28], dark, [0, project.height / 2, 0]);
  addBox(group, [0.24, project.height * 0.86, 1.38], green, [0.95, project.height * 0.43, 0]);
  addBox(group, [2.08, 0.16, 1.48], "#fff8dc", [0, project.height + 0.08, 0]);
  addFacadeGrid(group, 1.9, project.height, 1.28, 7, 3, "#83f6aa", 0.75);
  const bubbleMaterial = modelMaterial("#fffdf4", { roughness: 0.44 });
  [
    [-0.36, 1.18, 0.86, 0.34],
    [0.26, 2.05, 0.76, 0.3],
    [-0.2, 2.92, 1.02, 0.36],
  ].forEach(([x, y, width, height], index) => {
    [-0.69, 0.69].forEach((z) => {
      addBox(group, [width, height, 0.07], bubbleMaterial, [x, y, z]);
      addBox(group, [0.16, 0.12, 0.075], index % 2 === 0 ? green : "#101611", [x - width / 2 + 0.12, y - height / 2 - 0.08, z], [0, 0, -0.5]);
    });
  });
  addCone(group, 0.38, 0.72, 3, green, [0, project.height + 0.52, -0.02], [0, Math.PI / 2, Math.PI / 2]);
  return group;
}

function createJashbyModel(project: Project) {
  const group = new THREE.Group();
  const greenGlass = modelMaterial("#18b96f", { roughness: 0.24, metalness: 0.12 });
  addBox(group, [2.35, project.height, 1.42], greenGlass, [0, project.height / 2, 0]);
  addBox(group, [2.62, 0.16, 1.62], "#f6fff2", [0, project.height + 0.08, 0]);
  addFacadeGrid(group, 2.35, project.height, 1.42, 8, 5, "#dffff0", 0.68);
  for (let i = 0; i < 4; i += 1) {
    addBox(group, [2.38, 0.055, 1.28], i % 2 ? "#e8f8ed" : "#fffdf4", [0.1 - i * 0.07, 0.09 + i * 0.07, 0.82 + i * 0.05], [0, i * 0.08, 0]);
  }
  const lineMaterial = new THREE.MeshBasicMaterial({ color: "#219760" });
  for (let col = 0; col < 6; col += 1) {
    addBox(group, [0.022, 0.03, 1.24], lineMaterial, [-0.9 + col * 0.34, 0.39, 0.95]);
  }
  for (let row = 0; row < 4; row += 1) {
    addBox(group, [2.18, 0.028, 0.026], lineMaterial, [0, 0.28 + row * 0.16, 0.32]);
  }
  addBox(group, [0.16, 0.82, 0.12], "#f7d35f", [0.72, project.height + 0.56, 0.02]);
  return group;
}

function createQuantiumModel(project: Project) {
  const group = new THREE.Group();
  const glass = modelMaterial("#2f8ec7", { roughness: 0.2, metalness: 0.18 });
  addBox(group, [1.68, project.height, 1.68], glass, [0, project.height / 2, 0]);
  addBox(group, [1.92, 0.18, 1.92], "#d9eff7", [0, project.height + 0.09, 0]);
  addBox(group, [0.22, project.height * 0.9, 1.76], "#17476c", [-0.96, project.height * 0.45, 0]);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: "#aee7ff" });
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const active = (row + col) % 3 !== 0;
      [-0.86, 0.86].forEach((z) => {
        addBox(group, [0.11, 0.11, 0.028], active ? dotMaterial : "#0c3654", [-0.54 + col * 0.36, 0.78 + row * 0.34, z]);
      });
    }
  }
  [0.42, 0.74, 1.08].forEach((height, index) => {
    addBox(group, [0.22, height, 0.22], project.color, [0.38 + index * 0.28, project.height + height / 2 + 0.18, -0.38]);
  });
  return group;
}

function createDegree6Model(project: Project) {
  const group = new THREE.Group();
  addBox(group, [2.55, 0.18, 2.25], "#171925", [0, 0.09, 0], [0, 0.18, 0]);
  addCylinder(group, 0.42, 0.52, project.height, project.color, [0, project.height / 2 + 0.06, 0], [0, 0, 0], 32);
  const lineMaterial = modelMaterial("#d8d0ff", { roughness: 0.3, metalness: 0.16 });
  const nodeMaterial = modelMaterial("#b9a9ff", { emissive: "#1b0d4a", emissiveIntensity: 0.15 });
  const points = [
    new THREE.Vector3(-0.96, 1.02, -0.62),
    new THREE.Vector3(1.08, 1.28, -0.26),
    new THREE.Vector3(-0.48, 2.18, 0.86),
    new THREE.Vector3(0.88, 2.68, 0.64),
    new THREE.Vector3(-1.02, 3.05, -0.1),
  ];
  const hub = new THREE.Vector3(0, project.height * 0.56, 0);
  points.forEach((point, index) => {
    addCylinderBetween(group, hub, point, 0.025, lineMaterial);
    addSphere(group, index === 0 ? 0.18 : 0.15, nodeMaterial, [point.x, point.y, point.z], 20);
  });
  addSphere(group, 0.22, "#fff8dc", [hub.x, hub.y, hub.z], 24);
  return group;
}

function createGarageModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [2.42, 0.96, 1.64], "#f4e4bd", [0, 0.48, 0.1]);
  addBox(group, [2.66, 0.22, 1.86], project.color, [0, 1.08, 0.1], [0, 0, 0], { roughness: 0.42, metalness: 0.12 });
  addBox(group, [1.2, 0.58, 0.06], "#1c2322", [0, 0.42, -0.75]);
  addBox(group, [0.55, 0.34, 0.07], "#aee5f5", [-0.72, 0.62, -0.76]);
  addBox(group, [0.55, 0.34, 0.07], "#aee5f5", [0.72, 0.62, -0.76]);
  addBox(group, [1.7, 0.32, 0.86], "#d22f2f", [0, 0.32, -1.34]);
  addBox(group, [0.92, 0.32, 0.58], "#93d8ff", [0.05, 0.62, -1.34]);
  [-0.68, 0.68].forEach((x) => {
    [-1.66, -1.02].forEach((z) => {
      addCylinder(group, 0.18, 0.18, 0.16, "#171713", [x, 0.24, z], [0, 0, Math.PI / 2], 24);
      addCylinder(group, 0.09, 0.09, 0.18, "#c9c9c0", [x, 0.24, z], [0, 0, Math.PI / 2], 20);
    });
  });
  addBox(group, [0.66, 0.045, 0.92], "#fffdf4", [-0.95, 0.12, 0.96], [0, -0.1, 0]);
  addBox(group, [0.48, 0.05, 0.78], "#e8d8a8", [-0.8, 0.2, 1.02], [0, -0.1, 0]);
  return group;
}

function createPuckModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [2.75, 0.12, 1.82], "#cfefff", [0, 0.06, 0], [0, 0, 0], { roughness: 0.18, metalness: 0.02 });
  addBox(group, [2.92, 0.32, 0.12], "#fffdf4", [0, 0.22, -0.96]);
  addBox(group, [2.92, 0.32, 0.12], "#fffdf4", [0, 0.22, 0.96]);
  addBox(group, [0.12, 0.32, 1.82], "#fffdf4", [-1.46, 0.22, 0]);
  addBox(group, [0.12, 0.32, 1.82], "#fffdf4", [1.46, 0.22, 0]);
  addCylinder(group, 0.26, 0.26, 0.18, "#151713", [0.15, 0.25, 0.02], [0, 0, 0], 32);
  addCylinder(group, 0.035, 0.035, 0.92, project.color, [-0.82, 0.62, 0.5], [0, 0, 0], 12);
  addBox(group, [0.52, 0.34, 0.04], "#f7d35f", [-0.56, 0.91, 0.5], [0, 0, 0.1]);
  addBox(group, [0.08, 0.72, 0.08], "#e95344", [1.18, 0.46, -0.28]);
  addBox(group, [0.84, 0.08, 0.08], "#e95344", [1.18, 0.86, -0.28]);
  addBox(group, [0.08, 0.72, 0.08], "#e95344", [0.76, 0.46, -0.28]);
  return group;
}

function createDojoModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [2.42, 0.12, 1.82], "#252825", [0, 0.06, 0]);
  addBox(group, [1.12, 0.045, 1.6], "#2f68c8", [-0.58, 0.16, 0]);
  addBox(group, [1.12, 0.045, 1.6], project.color, [0.58, 0.16, 0]);
  addBox(group, [1.82, 0.74, 0.12], "#fffdf4", [0, 0.66, -0.96]);
  addBox(group, [0.62, 0.34, 0.14], "#151713", [-0.46, 0.73, -1.04]);
  addBox(group, [0.62, 0.34, 0.14], "#151713", [0.46, 0.73, -1.04]);
  addBox(group, [0.42, 0.07, 0.16], "#2f68c8", [-0.46, 0.76, -1.12]);
  addBox(group, [0.42, 0.07, 0.16], project.color, [0.46, 0.76, -1.12]);
  addBox(group, [0.08, 0.88, 0.08], "#1d201d", [-1.18, 0.54, -0.86]);
  addBox(group, [0.08, 0.88, 0.08], "#1d201d", [1.18, 0.54, -0.86]);
  return group;
}

function createIdeaAidModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [1.92, 1.18, 1.42], "#ede0c6", [0, 0.59, 0]);
  addBox(group, [2.14, 0.2, 1.62], project.color, [0, 1.28, 0], [0, 0, 0], { roughness: 0.38, metalness: 0.08 });
  addBox(group, [0.52, 0.58, 0.07], "#242225", [-0.44, 0.56, -0.74]);
  addBox(group, [0.52, 0.58, 0.07], "#fffdf4", [0.44, 0.56, -0.74]);
  addSphere(group, 0.36, "#f7d35f", [0, 1.93, 0], 32);
  addCylinder(group, 0.17, 0.21, 0.22, "#755f38", [0, 1.48, 0], [0, 0, 0], 18);
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    addBox(group, [0.05, 0.26, 0.05], "#f7d35f", [Math.cos(angle) * 0.62, 1.94 + Math.sin(angle) * 0.12, Math.sin(angle) * 0.62], [0, angle, 0.4]);
  }
  return group;
}

function createCityHallModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [2.42, 0.24, 1.72], "#d7c49b", [0, 0.12, 0]);
  addBox(group, [2.04, 1.28, 1.32], "#fff7df", [0, 0.88, 0]);
  [-0.72, -0.24, 0.24, 0.72].forEach((x) => {
    addCylinder(group, 0.075, 0.075, 1.2, "#d9d0bc", [x, 0.82, -0.72], [0, 0, 0], 18);
    addCylinder(group, 0.075, 0.075, 1.2, "#d9d0bc", [x, 0.82, 0.72], [0, 0, 0], 18);
  });
  addBox(group, [2.2, 0.16, 1.48], project.color, [0, 1.58, 0]);
  addCone(group, 1.04, 0.7, 3, "#f7d35f", [0, 1.98, -0.02], [0, Math.PI / 2, 0]);
  addBox(group, [0.28, 0.52, 0.08], "#101611", [0, 0.53, -0.69]);
  return group;
}

function createHarbourModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [3.05, 0.14, 1.82], "#e8d9b6", [0, 0.07, 0.1]);
  const shellMaterial = modelMaterial("#fff8e6", { roughness: 0.34, metalness: 0.02 });
  [-0.92, -0.44, 0.04, 0.52, 1.02].forEach((x, index) => {
    addCone(group, 0.42 + index * 0.025, 1.32 + index * 0.05, 4, shellMaterial, [x, 0.78, -0.3 + Math.abs(x) * 0.08], [0.02, Math.PI / 4, x * 0.25]);
  });
  const steel = modelMaterial("#56646b", { roughness: 0.28, metalness: 0.18 });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.045, 8, 56, Math.PI), steel);
  arch.position.set(-0.18, 1.22, 0.72);
  arch.rotation.z = Math.PI;
  group.add(arch);
  addBox(group, [2.86, 0.08, 0.18], steel, [-0.18, 0.58, 0.72]);
  [-1.52, 1.16].forEach((x) => {
    addBox(group, [0.18, 0.9, 0.22], steel, [x, 0.58, 0.72]);
  });
  addBox(group, [2.72, 0.045, 0.08], project.color, [0, 0.2, -0.98]);
  return group;
}

function createBondiModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [3.1, 0.08, 2.2], "#e4c875", [0, 0.04, 0]);
  addBox(group, [3.1, 0.06, 0.58], "#43a9c5", [0, 0.1, -0.86], [0, 0, 0], { roughness: 0.2 });
  const foam = new THREE.MeshBasicMaterial({ color: "#fffdf4" });
  [-1.1, -0.45, 0.22, 0.9].forEach((x, index) => {
    addBox(group, [0.5, 0.035, 0.035], foam, [x, 0.16, -0.56 - index * 0.07], [0, -0.18, 0]);
  });
  addBox(group, [0.78, 0.52, 0.72], "#f5f0d3", [-0.78, 0.46, 0.42]);
  addBox(group, [0.9, 0.12, 0.82], "#df513f", [-0.78, 0.78, 0.42]);
  addCylinder(group, 0.035, 0.035, 0.72, "#654b2f", [0.7, 0.48, 0.34], [0, 0, 0], 12);
  addCone(group, 0.45, 0.28, 24, "#f7d35f", [0.7, 0.95, 0.34]);
  ["#fff4bd", "#e6533f", "#2f8ec7"].forEach((color, index) => {
    addBox(group, [0.28, 0.055, 1.18], color, [0.32 + index * 0.34, 0.14, 0.8], [0, -0.45 + index * 0.18, 0]);
  });
  addBox(group, [0.22, 0.22, 0.22], project.color, [-1.32, 0.22, -0.12]);
  return group;
}

function createDoverHomeModel(project: Project) {
  const group = new THREE.Group();
  [-0.7, -0.2, 0.34, 0.88].forEach((x, index) => {
    addBox(group, [0.82, 0.36 + index * 0.07, 1.18], "#bda474", [x, 0.18 + index * 0.035, -0.08 + index * 0.22], [0, -0.16, 0]);
  });
  addBox(group, [1.44, 0.72, 1.02], "#fff2cf", [0.12, 0.78, -0.02]);
  addBox(group, [1.64, 0.16, 1.18], project.color, [0.12, 1.22, -0.02], [0, 0, 0], { roughness: 0.46 });
  addBox(group, [0.78, 0.34, 0.06], "#94d8e8", [0.06, 0.78, -0.56]);
  addBox(group, [0.54, 0.08, 0.72], "#d9d0bc", [0.9, 0.5, -0.3], [0, 0.28, 0]);
  addBox(group, [1.3, 0.05, 0.34], "#176b82", [-0.76, 0.18, 0.82], [0, -0.2, 0], { roughness: 0.2, metalness: 0.04 });
  return group;
}

function CityScene({
  activeId,
  onInspectProject,
  onNearbyProjectChange,
}: {
  activeId: string;
  onInspectProject: (id: string) => void;
  onNearbyProjectChange: (id: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialActiveIdRef = useRef(activeId);
  const onInspectProjectRef = useRef(onInspectProject);
  const onNearbyProjectChangeRef = useRef(onNearbyProjectChange);
  const didRunInitialFocusRef = useRef(false);
  const runtimeRef = useRef<{
    focusProject: (id: string) => void;
    captureMetrics: () => { active: string; objects: number; pixelReady: boolean };
  } | null>(null);

  useEffect(() => {
    onInspectProjectRef.current = onInspectProject;
  }, [onInspectProject]);

  useEffect(() => {
    onNearbyProjectChangeRef.current = onNearbyProjectChange;
  }, [onNearbyProjectChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b9dbe0");
    scene.fog = new THREE.Fog("#b9dbe0", 34, 74);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(12, 13.5, 18);

    const ambient = new THREE.HemisphereLight("#fff8df", "#1f5e5a", 2.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight("#fff2ca", 3.2);
    sun.position.set(-10, 18, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const textures: THREE.Texture[] = [];
    const addTexture = (texture?: THREE.Texture) => {
      if (texture) textures.push(texture);
      return texture;
    };

    const grass = addTexture(patternTexture("grass"));
    const sand = addTexture(patternTexture("sand"));
    const water = addTexture(patternTexture("water"));
    const road = addTexture(patternTexture("road"));
    const pitch = addTexture(patternTexture("pitch"));
    for (const texture of [grass, sand, water, road, pitch]) {
      if (!texture) continue;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8);
    }

    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    const addPlane = (
      width: number,
      depth: number,
      x: number,
      z: number,
      material: THREE.Material,
      y = 0,
    ) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      groundGroup.add(mesh);
      return mesh;
    };

    addPlane(34, 30, 2, 1.6, new THREE.MeshStandardMaterial({ color: "#4f8d55", map: grass }));
    addPlane(22, 7.8, -4.3, -10.7, new THREE.MeshStandardMaterial({ color: "#176b82", map: water, roughness: 0.25, metalness: 0.06 }), -0.04);
    addPlane(7.2, 26, 16.3, 2.6, new THREE.MeshStandardMaterial({ color: "#176b82", map: water, roughness: 0.25, metalness: 0.06 }), -0.045);
    addPlane(5.5, 9.4, 13.1, 4.2, new THREE.MeshStandardMaterial({ color: "#e4c875", map: sand }), 0.01);
    addPlane(6.6, 5.6, -0.2, -4.5, new THREE.MeshStandardMaterial({ color: "#2c302b", map: road }), 0.02);
    addPlane(7.8, 3.2, -5.6, -8.1, new THREE.MeshStandardMaterial({ color: "#d5c7a6", roughness: 0.75 }), 0.018);
    addPlane(3.4, 16, 7.7, 3.5, new THREE.MeshStandardMaterial({ color: "#2c302b", map: road }), 0.025);
    addPlane(14, 3.1, 5.2, 0.7, new THREE.MeshStandardMaterial({ color: "#2c302b", map: road }), 0.026);
    addPlane(8.6, 5.8, 6.2, 7.8, new THREE.MeshStandardMaterial({ color: "#2c8d4a", map: pitch }), 0.035);

    addSydneyLandmarks(scene, addTexture);
    addCityPaths(scene);

    const colliders: THREE.Object3D[] = [];
    const projectGroups = new Map<string, THREE.Group>();
    const rings = new Map<string, THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>>();
    const projectStops = new Map<string, { position: THREE.Vector3; radius: number }>();
    const loader = new THREE.TextureLoader();

    cityItems.forEach((project) => {
      const group = new THREE.Group();
      group.position.set(project.x, 0, project.z);
      group.userData.projectId = project.id;

      const model = createProjectModel(project);
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          object.userData.projectId = project.id;
          colliders.push(object);
        }
      });
      group.add(model);

      const imageTexture = project.image
        ? addTexture(loader.load(project.image, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          }))
        : addTexture(projectTexture(project));

      const imageDecal = new THREE.Mesh(
        new THREE.PlaneGeometry(project.tier === "flagship" ? 2.45 : 2.05, project.tier === "flagship" ? 1.45 : 1.2),
        new THREE.MeshBasicMaterial({ map: imageTexture, side: THREE.DoubleSide }),
      );
      imageDecal.rotation.x = -Math.PI / 2;
      imageDecal.position.set(0, 0.105, project.tier === "flagship" ? -1.95 : -1.65);
      imageDecal.userData.projectId = project.id;
      group.add(imageDecal);
      colliders.push(imageDecal);

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 0.8),
        new THREE.MeshBasicMaterial({ map: addTexture(labelTexture(project)), side: THREE.DoubleSide }),
      );
      label.rotation.x = -Math.PI / 2;
      label.position.set(0, 0.11, 1.38);
      label.userData.projectId = project.id;
      group.add(label);
      colliders.push(label);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.035, 8, 72),
        new THREE.MeshBasicMaterial({ color: "#fff8dc", transparent: true, opacity: 0.18 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08;
      group.add(ring);
      rings.set(project.id, ring);
      projectStops.set(project.id, {
        position: new THREE.Vector3(project.x, 0, project.z),
        radius: project.tier === "flagship" ? 3.1 : 2.65,
      });

      scene.add(group);
      projectGroups.set(project.id, group);
    });

    const player = createSoccerBall();
    scene.add(player);
    const target = new THREE.Vector3();
    const activeIdRef = { current: initialActiveIdRef.current };
    const nearbyIdRef = { current: null as string | null };
    let playerControlled = false;

    const focusProject = (id: string) => {
      activeIdRef.current = id;
      rings.forEach((ring, projectId) => {
        ring.material.opacity = projectId === id ? 0.9 : 0.24;
        ring.material.color.set(projectId === id ? "#fff8dc" : "#c8d0be");
      });
      const group = projectGroups.get(id);
      if (group && !playerControlled) target.set(group.position.x, 0, group.position.z + 2.2);
    };

    focusProject(initialActiveIdRef.current);
    const startPosition = new THREE.Vector3(4, 0, 3.2);
    target.copy(startPosition);
    player.position.copy(startPosition);

    const keys = new Set<string>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        keys.add(key);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase());
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(colliders, true)[0];
      const id = hit?.object.userData.projectId as string | undefined;
      if (id) onInspectProjectRef.current?.(id);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("fullscreenchange", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    resize();

    let animationFrame = 0;
    let last = performance.now();

    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      const direction = new THREE.Vector3();
      if (keys.has("w") || keys.has("arrowup")) direction.z -= 1;
      if (keys.has("s") || keys.has("arrowdown")) direction.z += 1;
      if (keys.has("a") || keys.has("arrowleft")) direction.x -= 1;
      if (keys.has("d") || keys.has("arrowright")) direction.x += 1;

      if (direction.lengthSq() > 0) {
        direction.normalize().multiplyScalar(delta * 7.2);
        playerControlled = true;
        const previousPosition = player.position.clone();
        player.position.add(direction);
        player.position.x = THREE.MathUtils.clamp(player.position.x, -11.8, 17.4);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -12.6, 13.6);
        target.copy(player.position);
        const moved = player.position.clone().sub(previousPosition);
        const rollAxis = new THREE.Vector3(moved.z, 0, -moved.x).normalize();
        if (moved.lengthSq() > 0.000001 && Number.isFinite(rollAxis.x)) {
          player.rotateOnWorldAxis(rollAxis, moved.length() / 0.34);
        }
      } else {
        player.position.lerp(target, 0.035);
      }

      if (playerControlled) {
        let nearestId: string | null = null;
        let nearestDistance = Number.POSITIVE_INFINITY;
        projectStops.forEach((stop, id) => {
          const distance = player.position.distanceTo(stop.position);
          if (distance < stop.radius && distance < nearestDistance) {
            nearestId = id;
            nearestDistance = distance;
          }
        });
        if (nearestId !== nearbyIdRef.current) {
          nearbyIdRef.current = nearestId;
          if (nearestId) {
            focusProject(nearestId);
          }
          onNearbyProjectChangeRef.current?.(nearestId);
        }
      }

      const cameraTarget = new THREE.Vector3(player.position.x + 9.6, 13.5, player.position.z + 15.4);
      camera.position.lerp(cameraTarget, 0.055);
      camera.lookAt(player.position.x + 1.2, 0.9, player.position.z - 1.1);

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    runtimeRef.current = {
      focusProject,
      captureMetrics: () => {
        const context = renderer.getContext();
        return {
          active: activeIdRef.current,
          objects: scene.children.length,
          pixelReady: Boolean(context && canvas.width > 0 && canvas.height > 0),
        };
      },
    };

    window.__portfolioCityStatus = () => ({
      active: activeIdRef.current,
      canvas: { width: canvas.width, height: canvas.height },
      nearby: nearbyIdRef.current,
      objects: scene.children.length,
      player: {
        x: Number(player.position.x.toFixed(2)),
        z: Number(player.position.z.toFixed(2)),
      },
    });
    canvas.dataset.cityReady = "true";
    canvas.dataset.cityObjects = String(scene.children.length);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("fullscreenchange", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      textures.forEach((texture) => texture.dispose());
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      runtimeRef.current = null;
      delete canvas.dataset.cityReady;
      delete canvas.dataset.cityObjects;
      delete window.__portfolioCityStatus;
    };
  }, []);

  useEffect(() => {
    if (!didRunInitialFocusRef.current) {
      didRunInitialFocusRef.current = true;
      return;
    }
    runtimeRef.current?.focusProject(activeId);
  }, [activeId]);

  return <canvas ref={canvasRef} className="city-canvas" data-scene-ready="true" aria-label="3D portfolio city" />;
}

function addCityPaths(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: "#e7d093", roughness: 0.86 });
  const pathSpecs: Array<[number, number, number, number, number]> = [
    [-5.6, -7.18, 6.8, 0.28, 0],
    [-0.15, -5.38, 5.7, 0.3, 0],
    [1.34, -3.24, 6.65, 0.28, -0.67],
    [7.6, 0.82, 10.9, 0.32, -0.45],
    [11.72, 3.35, 0.34, 6.4, 0],
    [6.28, 6.08, 0.34, 8.75, 0],
    [5.56, 8.2, 8.4, 0.28, 0],
  ];
  pathSpecs.forEach(([x, z, width, depth, rotation]) => {
    const path = new THREE.Mesh(new THREE.BoxGeometry(width, 0.035, depth), material);
    path.position.set(x, 0.075, z);
    path.rotation.y = rotation;
    path.receiveShadow = true;
    scene.add(path);
  });
}

function addSydneyLandmarks(
  scene: THREE.Scene,
  addTexture: (texture?: THREE.Texture) => THREE.Texture | undefined,
) {
  const landmarks = new THREE.Group();
  scene.add(landmarks);

  addBox(landmarks, [6.3, 0.16, 2.25], "#e8d9b6", [-5.65, 0.08, -8.35]);

  const operaGroup = new THREE.Group();
  operaGroup.position.set(-5.78, 0.2, -8.45);
  const shellMaterial = new THREE.MeshStandardMaterial({ color: "#fff8e6", roughness: 0.38 });
  [-1.55, -0.82, -0.08, 0.68, 1.42].forEach((offset, index) => {
    const shell = new THREE.Mesh(new THREE.ConeGeometry(0.66 + index * 0.05, 2.02 + index * 0.08, 4), shellMaterial);
    shell.position.set(offset * 0.46, 0.98, Math.abs(offset) * 0.08);
    shell.rotation.z = offset * 0.24;
    shell.rotation.y = Math.PI / 4;
    shell.castShadow = true;
    operaGroup.add(shell);
  });
  landmarks.add(operaGroup);

  const bridgeMaterial = new THREE.MeshStandardMaterial({ color: "#56646b", roughness: 0.32, metalness: 0.12 });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.07, 8, 72, Math.PI), bridgeMaterial);
  arch.position.set(-5.8, 1.58, -10.15);
  arch.rotation.z = Math.PI;
  arch.castShadow = true;
  landmarks.add(arch);
  addBox(landmarks, [6.25, 0.12, 0.28], bridgeMaterial, [-5.8, 0.62, -10.15]);
  [-2.92, 2.92].forEach((x) => {
    addBox(landmarks, [0.32, 1.44, 0.38], bridgeMaterial, [-5.8 + x, 0.78, -10.15]);
  });
  [-2.1, -1.3, -0.48, 0.42, 1.28, 2.12].forEach((x) => {
    addBox(landmarks, [0.035, 0.74 + (2.2 - Math.abs(x)) * 0.18, 0.04], bridgeMaterial, [-5.8 + x, 0.96, -10.15]);
  });

  const skylineMaterials = [
    new THREE.MeshStandardMaterial({ color: "#2f5157", roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: "#415f66", roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: "#263d44", roughness: 0.48, metalness: 0.08 }),
  ];
  for (let i = 0; i < 16; i += 1) {
    const height = 0.92 + (i % 6) * 0.38;
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-3.4 + i * 0.46, 0, -6.18 + (i % 3) * 0.43);
    towerGroup.rotation.y = (i % 2 ? 0.08 : -0.06);
    addBox(towerGroup, [0.36 + (i % 3) * 0.08, height, 0.44], skylineMaterials[i % skylineMaterials.length], [0, height / 2, 0]);
    if (i % 2 === 0) addFacadeGrid(towerGroup, 0.36 + (i % 3) * 0.08, height, 0.44, 4, 2, "#bde5dc", 0.44);
    landmarks.add(towerGroup);
  }

  const foamMaterial = new THREE.MeshBasicMaterial({ color: "#f8fbf0", transparent: true, opacity: 0.82 });
  for (let i = 0; i < 7; i += 1) {
    addBox(landmarks, [0.08, 0.035, 3.4 + i * 0.18], foamMaterial, [14.8 + i * 0.16, 0.12, 1.58 + i * 0.78], [0, -0.08, 0]);
  }

  const surfColors = ["#fff4bd", "#e6533f", "#2f8ec7", "#22d66f", "#f7d35f"];
  for (let i = 0; i < 6; i += 1) {
    addBox(landmarks, [0.35, 0.055, 1.55], surfColors[i % surfColors.length], [12.04 + i * 0.34, 0.15, 3.15 + i * 0.36], [0, i * 0.24 - 0.52, 0], { roughness: 0.54 });
  }

  const cliffMaterial = modelMaterial("#bda474", { roughness: 0.86 });
  for (let i = 0; i < 5; i += 1) {
    addBox(landmarks, [0.86, 0.62 + i * 0.1, 1.34], cliffMaterial, [10.08 + i * 0.32, 0.31 + i * 0.05, 0.6 + i * 0.35], [0, -0.18, 0]);
  }

  const houseGroup = new THREE.Group();
  houseGroup.position.set(10.86, 0.2, 1.32);
  addBox(houseGroup, [1.05, 0.68, 0.9], "#f6e8c6", [0, 0.42, 0]);
  addCone(houseGroup, 0.82, 0.48, 4, "#cc6543", [0, 0.98, 0], [0, Math.PI / 4, 0]);
  addBox(houseGroup, [0.78, 0.24, 0.05], "#94d8e8", [0, 0.5, -0.48]);
  landmarks.add(houseGroup);

  const pitchLine = new THREE.MeshBasicMaterial({ color: "#f9f6e9" });
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 5.35), pitchLine);
  centerLine.position.set(6.2, 0.11, 7.8);
  landmarks.add(centerLine);
  const centerCircle = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.025, 8, 64), pitchLine);
  centerCircle.rotation.x = Math.PI / 2;
  centerCircle.position.set(6.2, 0.12, 7.8);
  landmarks.add(centerCircle);
  [2.3, 10.1].forEach((x) => {
    const goal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 1.6), pitchLine);
    goal.position.set(x, 0.35, 7.8);
    landmarks.add(goal);
  });

  const gymMaterial = new THREE.MeshStandardMaterial({ color: "#252825", roughness: 0.45, metalness: 0.2 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 14), gymMaterial);
  bar.position.set(9.6, 0.45, 5.28);
  bar.rotation.z = Math.PI / 2;
  bar.castShadow = true;
  landmarks.add(bar);
  [-2.25, 2.25].forEach((x) => {
    for (let i = 0; i < 3; i += 1) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.42 - i * 0.05, 0.42 - i * 0.05, 0.13, 28), gymMaterial);
      plate.position.set(9.6 + x + i * 0.12 * Math.sign(x), 0.45, 5.28);
      plate.rotation.z = Math.PI / 2;
      plate.castShadow = true;
      landmarks.add(plate);
    }
  });

  landmarks.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  addLandmarkSign(scene, addTexture, "Sydney Opera House", "harbour anchor", -4.1, -7.2, "#fff1bf");
  addLandmarkSign(scene, addTexture, "Harbour Bridge", "north-west span", -8.15, -9.04, "#9fb2bd");
  addLandmarkSign(scene, addTexture, "Bondi Beach", "eastern surf strip", 12.02, 3.02, "#4cbad8");
  addLandmarkSign(scene, addTexture, "Dover Heights", "home base", 10.0, 0.36, "#f0c36a");
}

function addLandmarkSign(
  scene: THREE.Scene,
  addTexture: (texture?: THREE.Texture) => THREE.Texture | undefined,
  title: string,
  subtitle: string,
  x: number,
  z: number,
  color: string,
) {
  const texture = addTexture(createCanvasTexture(768, 256, (ctx) => {
    ctx.fillStyle = "rgba(255,253,244,0.96)";
    ctx.fillRect(0, 0, 768, 256);
    ctx.strokeStyle = "#151713";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 754, 242);
    ctx.fillStyle = color;
    ctx.fillRect(24, 24, 112, 208);
    ctx.fillStyle = "#151713";
    ctx.font = "900 50px Arial";
    wrapCanvasText(ctx, title, 166, 104, 540, 54);
    ctx.fillStyle = "#485048";
    ctx.font = "800 28px Arial";
    ctx.fillText(subtitle.toUpperCase(), 168, 210);
  }));
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 0.9),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true }),
  );
  sign.rotation.x = -Math.PI / 2;
  sign.position.set(x, 0.13, z);
  scene.add(sign);
}

function createSoccerBall() {
  const group = new THREE.Group();
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 48, 24),
    new THREE.MeshStandardMaterial({ color: "#f8f7ef", roughness: 0.46 }),
  );
  ball.position.y = 0.38;
  ball.castShadow = true;
  group.add(ball);

  const patchMaterial = new THREE.MeshBasicMaterial({ color: "#151713", side: THREE.DoubleSide });
  const patchDirections = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0.94, 0.2, 0.28),
    new THREE.Vector3(-0.94, 0.2, 0.28),
    new THREE.Vector3(0.35, 0.06, 0.94),
    new THREE.Vector3(-0.35, 0.06, -0.94),
    new THREE.Vector3(0.82, -0.45, -0.34),
    new THREE.Vector3(-0.82, -0.45, -0.34),
  ];
  patchDirections.forEach((direction) => {
    const normal = direction.clone().normalize();
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.105, 5), patchMaterial);
    patch.position.copy(normal.clone().multiplyScalar(0.345));
    patch.lookAt(normal.clone().multiplyScalar(0.7));
    ball.add(patch);
  });

  const marker = new THREE.Mesh(
    new THREE.TorusGeometry(0.64, 0.025, 8, 42),
    new THREE.MeshBasicMaterial({ color: "#f7d35f" }),
  );
  marker.rotation.x = Math.PI / 2;
  marker.position.y = 0.035;
  group.add(marker);

  return group;
}

export default function MuseumPortfolio() {
  const mapShellRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(cityItems[0].id);
  const [detailMode, setDetailMode] = useState<"closed" | "auto" | "pinned">("closed");
  const [dismissedZoneId, setDismissedZoneId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const activeProject = selectableItems.find((project) => project.id === activeId) ?? cityItems[0];
  const detailsOpen = detailMode !== "closed";

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsMapFullscreen(document.fullscreenElement === mapShellRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-map-fullscreen", isMapFullscreen);
    const closeFallbackFullscreen = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) {
        setIsMapFullscreen(false);
      }
    };
    document.addEventListener("keydown", closeFallbackFullscreen);
    return () => {
      document.body.classList.remove("is-map-fullscreen");
      document.removeEventListener("keydown", closeFallbackFullscreen);
    };
  }, [isMapFullscreen]);

  const openProjectDetails = (id: string, scrollToStage = false) => {
    setActiveId(id);
    setDetailMode("pinned");
    setDismissedZoneId(null);
    if (scrollToStage) {
      requestAnimationFrame(() => {
        document.querySelector(".city-map-shell")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const closeProjectDetails = () => {
    setDetailMode("closed");
    setDismissedZoneId(activeId);
  };

  const handleNearbyProjectChange = (id: string | null) => {
    if (detailMode === "pinned") return;

    if (!id) {
      setDismissedZoneId(null);
      setDetailMode((mode) => (mode === "auto" ? "closed" : mode));
      return;
    }

    setActiveId(id);
    if (dismissedZoneId !== id) {
      setDetailMode("auto");
    }
  };

  const toggleMapFullscreen = () => {
    setIsMapFullscreen((fullscreen) => !fullscreen);
  };

  const filteredProjects = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const filterMatches =
        filter === "All" ||
        project.category === filter ||
        (filter === "Learning" && project.tier === "learning");
      const searchMatches =
        !cleanQuery ||
        [project.title, project.shortTitle, project.summary, project.stack.join(" "), project.zone]
          .join(" ")
          .toLowerCase()
          .includes(cleanQuery);
      return filterMatches && searchMatches;
    });
  }, [filter, query]);

  return (
    <main className="city-page" id="top">
      <section className="city-hero" id="museum" aria-labelledby="hero-title">
        <nav className="contact-ribbon" aria-label="Primary navigation">
          <a className="brand-lockup" href="#top" aria-label="Jake Glick home">
            <span>JG</span>
            <strong>Jake Glick</strong>
          </a>
          <div className="contact-links">
            {contactLinks.map(({ label, href, Icon }) => (
              <a key={href} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"}>
                <Icon size={17} aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="city-hero-copy">
          <div className="city-intro">
            <p className="kicker">
              <MapPin size={16} aria-hidden="true" />
              Sydney portfolio city
            </p>
            <h1 id="hero-title">Jake Glick</h1>
            <p>
              Software builder from Sydney making web apps, mobile games, spreadsheet tools,
              data stories, study software, and a few useful things from real life.
            </p>
          </div>

          <div className="hero-stats" aria-label="Portfolio facts">
            {cityStats.map(([value, label]) => (
              <span key={label}>
                <strong>{value}</strong>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="city-walkthrough">
          <div
            className={`city-map-shell${isMapFullscreen ? " is-fullscreen" : ""}`}
            ref={mapShellRef}
          >
            <div className="stage-toolbar" aria-label="3D map controls">
              <button
                className="stage-action"
                type="button"
                onClick={toggleMapFullscreen}
                aria-label={isMapFullscreen ? "Exit full screen map" : "Open full screen map"}
              >
                {isMapFullscreen ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                <span>{isMapFullscreen ? "Exit full screen" : "Full screen"}</span>
              </button>
            </div>
            <div className="city-stage">
              <CityScene
                activeId={activeId}
                onInspectProject={openProjectDetails}
                onNearbyProjectChange={handleNearbyProjectChange}
              />
              {detailsOpen ? (
                <ProjectInspector project={activeProject} onClose={closeProjectDetails} />
              ) : null}
            </div>
          </div>
        </div>

        <div className="city-controls">
          <div className="interest-strip" aria-label="Personal landmarks">
            {landmarkButtons.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={activeId === id ? "is-active" : ""}
                onClick={() => openProjectDetails(id, true)}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="archive-section" id="archive" aria-labelledby="archive-title">
        <div className="section-copy">
          <p className="eyebrow">complete archive</p>
          <h2 id="archive-title">The full trail lives here; the city only keeps the landmarks.</h2>
          <p>
            The 3D map is intentionally curated. This archive keeps the shipped apps, prototypes,
            learning repos, and local practice folders searchable without crowding the landscape.
          </p>
        </div>

        <div className="archive-controls">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
            />
          </label>
          <div className="filter-row" aria-label="Archive filters">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "is-active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="archive-grid">
          {filteredProjects.map((project) => (
            <button
              className={`archive-card ${project.id === activeId ? "is-active" : ""}`}
              key={project.id}
              type="button"
              onClick={() => openProjectDetails(project.id, true)}
              style={{ "--project-color": project.color } as CSSProperties}
            >
              <span>{project.year}</span>
              <strong>{project.title}</strong>
              <small>{project.category} / {tierLabel(project.tier)}</small>
              <p>{project.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="section-copy">
          <p className="eyebrow">experience</p>
          <h2 id="experience-title">The work around the builds.</h2>
        </div>
        <div className="experience-list">
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

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="section-copy">
          <p className="eyebrow">contact</p>
          <h2 id="contact-title">For projects, roles, and things worth building.</h2>
          <p>
            Email is the cleanest direct line. GitHub is the code trail. LinkedIn is the role trail.
          </p>
        </div>
        <div className="contact-card">
          {contactLinks.map(({ label, href, Icon }) => (
            <a key={href} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"}>
              <Icon size={20} aria-hidden="true" />
              {label}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>Built from the attached DOCX, public GitHub metadata, live captures, and local project folders.</span>
        <span>Private WhatsApp chat contents were not used.</span>
      </footer>
    </main>
  );
}

function ProjectInspector({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <aside className="project-inspector" style={{ "--project-color": project.color } as CSSProperties}>
      <div className="inspector-header">
        <div className="inspector-heading">
          <p className="room-zone">{project.zone}</p>
          <h2>{project.title}</h2>
          <p className="status-line">{project.year} / {project.status}</p>
        </div>
        <button className="inspector-close" type="button" onClick={onClose} aria-label="Close project details">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="inspector-media">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? `${project.title} screenshot`}
            width={720}
            height={430}
            sizes="(max-width: 760px) 88vw, 360px"
            loading="eager"
          />
        ) : (
          <div className="generated-mark" aria-hidden="true">
            <Building2 size={44} />
            <span>{project.shortTitle}</span>
          </div>
        )}
      </div>
      <p>{project.detail}</p>
      <div className="chip-list" aria-label={`${project.title} stack`}>
        {project.stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="evidence-list" aria-label={`${project.title} evidence`}>
        {project.proof.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="project-links">
        {project.links.length ? (
          project.links.map((link) => {
            const Icon = linkIcon(link.kind);
            return (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                <Icon size={16} aria-hidden="true" />
                {link.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            );
          })
        ) : (
          <span className="local-note">Local artifact</span>
        )}
      </div>
    </aside>
  );
}
