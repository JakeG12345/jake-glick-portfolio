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
import {
  Project,
  projects,
  projectById,
  projectImageSrc,
  projectImageAlt,
  isSvgImage,
  featuredProject,
} from "./data/projects";

declare global {
  interface Window {
    __portfolioCityStatus?: () => {
      active: string;
      canvas: { height: number; width: number };
      nearby: string | null;
      objects: number;
      bounds: { maxX: number; maxZ: number; minX: number; minZ: number };
      camera: { fov: number; x: number; y: number; z: number };
      player: { radius: number; x: number; y: number; z: number };
      target: { x: number; y: number; z: number };
      routeQueue: number;
      walkable: boolean;
      radiusWalkable: boolean;
      safeLandmarks: { harbourBridge: boolean; milsonsPoint: boolean; northSydney: boolean };
      northSydneyReachable: boolean;
      bridgeCrossingReady: boolean;
      reachableProjectCount: number;
      screenLandmarks: Record<string, { visible: boolean; x: number; y: number }>;
      screenWaterSamples: Record<string, { radiusWalkable: boolean; visible: boolean; x: number; y: number }>;
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

// Projects are imported from ./data/projects to keep the scene component small
// and maintainable. See app/data/projects.ts for the full data set.
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

type MapPoint = { x: number; z: number };

const sydneyMap = {
  originLatitude: -33.8731,
  originLongitude: 151.2073,
  originX: -5.2,
  originZ: -4.8,
  latitudeScale: 415,
  longitudeScale: 365,
};

function mapSydney(longitude: number, latitude: number, nudge: Partial<MapPoint> = {}): MapPoint {
  return {
    x: sydneyMap.originX + (longitude - sydneyMap.originLongitude) * sydneyMap.longitudeScale + (nudge.x ?? 0),
    z: sydneyMap.originZ + (sydneyMap.originLatitude - latitude) * sydneyMap.latitudeScale + (nudge.z ?? 0),
  };
}

function nudgePoint(point: MapPoint, x = 0, z = 0): MapPoint {
  return { x: point.x + x, z: point.z + z };
}

function pathPolygon(start: MapPoint, end: MapPoint, width: number): MapPoint[] {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.01) return [];
  const normalX = (-dz / length) * (width / 2);
  const normalZ = (dx / length) * (width / 2);
  return [
    { x: start.x + normalX, z: start.z + normalZ },
    { x: end.x + normalX, z: end.z + normalZ },
    { x: end.x - normalX, z: end.z - normalZ },
    { x: start.x - normalX, z: start.z - normalZ },
  ];
}

function plotPolygon(center: MapPoint, width: number, depth = width): MapPoint[] {
  return [
    { x: center.x - width / 2, z: center.z - depth / 2 },
    { x: center.x + width / 2, z: center.z - depth / 2 },
    { x: center.x + width / 2, z: center.z + depth / 2 },
    { x: center.x - width / 2, z: center.z + depth / 2 },
  ];
}

function pointInPolygon(point: MapPoint, polygon: MapPoint[]) {
  let inside = false;
  for (
    let currentIndex = 0, previousIndex = polygon.length - 1;
    currentIndex < polygon.length;
    previousIndex = currentIndex, currentIndex += 1
  ) {
    const current = polygon[currentIndex];
    const previous = polygon[previousIndex];
    const intersects =
      current.z > point.z !== previous.z > point.z &&
      point.x < ((previous.x - current.x) * (point.z - current.z)) / (previous.z - current.z) + current.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInWalkableAreas(x: number, z: number, areas: MapPoint[][]) {
  return areas.some((area) => pointInPolygon({ x, z }, area));
}

function pointInWalkableAreasWithRadius(x: number, z: number, areas: MapPoint[][], radius: number) {
  if (!pointInWalkableAreas(x, z, areas)) return false;
  if (radius <= 0.01) return true;

  const sampleCount = 14;
  for (let i = 0; i < sampleCount; i += 1) {
    const angle = (i / sampleCount) * Math.PI * 2;
    const sampleX = x + Math.cos(angle) * radius;
    const sampleZ = z + Math.sin(angle) * radius;
    if (!pointInWalkableAreas(sampleX, sampleZ, areas)) return false;
  }
  return true;
}

function segmentInWalkableAreas(start: MapPoint, end: MapPoint, areas: MapPoint[][], radius: number) {
  const distance = Math.hypot(end.x - start.x, end.z - start.z);
  const steps = Math.max(1, Math.ceil(distance / Math.max(0.16, radius * 0.55)));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    if (!pointInWalkableAreasWithRadius(
      THREE.MathUtils.lerp(start.x, end.x, t),
      THREE.MathUtils.lerp(start.z, end.z, t),
      areas,
      radius,
    )) {
      return false;
    }
  }
  return true;
}

const sydneyPlaces = {
  harbourBridge: mapSydney(151.2108, -33.8523, { x: -0.5, z: 0.2 }),
  milsonsPoint: mapSydney(151.2116, -33.8462, { x: -0.2, z: 0.55 }),
  northSydney: mapSydney(151.2073, -33.8399, { x: -0.2, z: 1.45 }),
  kirribilli: mapSydney(151.2165, -33.8485, { x: -0.25, z: 0.2 }),
  operaHouse: mapSydney(151.2153, -33.8568, { x: -0.25, z: 0.35 }),
  cbd: mapSydney(151.2073, -33.8731),
  centralStation: mapSydney(151.2068, -33.8831, { x: -0.65, z: 0.05 }),
  blackbird: mapSydney(151.2118, -33.8818, { x: 0.35, z: -0.25 }),
  eveleigh: mapSydney(151.1945, -33.8952, { x: 0.35, z: -0.05 }),
  bondiJunction: mapSydney(151.2507, -33.8927, { x: 0.2, z: -0.7 }),
  queensPark: mapSydney(151.2474, -33.8976, { x: -0.35, z: -0.15 }),
  sportsField: mapSydney(151.2489, -33.9013, { x: 1.45, z: 0.45 }),
  doverHeights: mapSydney(151.2802, -33.8707, { x: -0.25, z: 0.15 }),
  bondiBeach: mapSydney(151.2743, -33.8915, { x: -0.4, z: 0.15 }),
};

const cityProjectPlots = {
  whatsappWrapped: nudgePoint(sydneyPlaces.blackbird, 5.8, 2.8),
  jashby: nudgePoint(sydneyPlaces.bondiJunction, 5.9, -3.85),
  quantium: nudgePoint(sydneyPlaces.eveleigh, -5.85, 3.4),
  doverHome: nudgePoint(sydneyPlaces.doverHeights, 2.45, -2.45),
  bondiBeach: nudgePoint(sydneyPlaces.bondiBeach, -1.15, 3.05),
  sydneyHarbour: nudgePoint(sydneyPlaces.operaHouse, 3.45, -2.25),
  carLifestory: nudgePoint(sydneyPlaces.doverHeights, 5.1, 1.0),
  whatThePuck: nudgePoint(sydneyPlaces.sportsField, 6.05, 3.6),
  moriahJiuJitsu: nudgePoint(sydneyPlaces.queensPark, -2.7, -4.25),
  degree6: nudgePoint(sydneyPlaces.centralStation, -7.25, -2.85),
  ideaAid: nudgePoint(sydneyPlaces.queensPark, -6.75, 5.15),
  portfolio: nudgePoint(sydneyPlaces.cbd, -8.4, -3.55),
};

const archiveDistricts = {
  graveyard: {
    center: nudgePoint(sydneyPlaces.northSydney, -9.8, 3.2),
    entry: nudgePoint(sydneyPlaces.northSydney, -4.25, 1.15),
  },
  learningCentre: {
    center: { x: 25.2, z: 18.9 },
    entry: { x: 20.35, z: 14.85 },
  },
};

const cityItems: Project[] = [
  featuredProject("whatsapp-wrapped", {
    title: "Blackbird / WhatsAppWrapped",
    shortTitle: "Blackbird",
    zone: "Surry Hills startup block",
    status: "Blackbird camp build",
    detail:
      "WhatsAppWrapped sits in the Surry Hills / Blackbird block because that camp is where the museum-style idea became a real product surface: local parsing, recap cards, and the first archive walk.",
    proof: ["Blackbird camp build", "Public GitHub repo", "Local README privacy model"],
    color: "#22d66f",
    ...cityProjectPlots.whatsappWrapped,
    height: 4.1,
  }),
  featuredProject("jashby", {
    zone: "Bondi Junction spreadsheet campus",
    detail:
      "Jashby gets the spreadsheet campus: the long-running founder thread around turning Excel and Google Sheets learning into levels, daily challenges, onboarding, analytics, and real user loops.",
    ...cityProjectPlots.jashby,
    height: 4.2,
  }),
  {
    id: "quantium-work-experience",
    title: "Quantium Work Experience",
    shortTitle: "Quantium",
    year: "2024",
    zone: "Eveleigh data yard",
    category: "Experience",
    tier: "built",
    status: "Work experience",
    summary:
      "An Eveleigh-side data tower for the Quantium work-experience week around CommBank iQ analytics and market-data scraping.",
    detail:
      "This is mapped around Eveleigh rather than as a generic office block. It anchors the analytics side of the portfolio: client data, market signals, and a scraper built in a professional context.",
    stack: ["Data analytics", "Web scraping", "CommBank iQ context"],
    proof: ["Attached DOCX role notes", "Experience entry"],
    source: "Attached DOCX",
    color: "#2f8ec7",
    ...cityProjectPlots.quantium,
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
    ...cityProjectPlots.doverHome,
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
    ...cityProjectPlots.bondiBeach,
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
    ...cityProjectPlots.sydneyHarbour,
    height: 1.8,
    links: [],
  },
  featuredProject("car-lifestory-web", {
    title: "Dover Garage / Car Lifestory",
    shortTitle: "Car Story",
    zone: "Dover garage",
    detail:
      "Car Lifestory sits by the Dover Heights home marker because the product starts from a real car-history problem: ownership paperwork, service records, costs, exports, and scan-to-form entry.",
    ...cityProjectPlots.carLifestory,
    height: 2.5,
  }),
  featuredProject("what-the-puck", {
    zone: "Sports field",
    detail:
      "What The Puck sits beside the football pitch as the public-game landmark: Unity, C#, mobile launch work, and the first project here that shipped to app stores.",
    ...cityProjectPlots.whatThePuck,
    height: 2.9,
  }),
  featuredProject("moriah-jiu-jitsu", {
    zone: "Queens Park school block",
    detail:
      "The Moriah Jiu-Jitsu tool is placed in the Queens Park school block because it is an operational Moriah sport system: divisions, athletes, scoring, leaderboards, and live competition admin.",
    ...cityProjectPlots.moriahJiuJitsu,
    height: 2.6,
  }),
  featuredProject("degree6", {
    zone: "Network interchange",
    detail:
      "Degree6 becomes the network interchange: a D3 graph tool for searching and exploring degrees of separation through LinkedIn-style relationship data.",
    ...cityProjectPlots.degree6,
    height: 3.1,
  }),
  featuredProject("idea-aid", {
    zone: "AI workshop",
    detail:
      "Idea Aid stays as the early AI workshop: a CS50 Flask app where prompts, SQL, auth, Bootstrap, and the OpenAI API first became an actual user-facing generator.",
    ...cityProjectPlots.ideaAid,
    height: 2.2,
  }),
  featuredProject("portfolio", {
    zone: "City hall",
    detail:
      "The portfolio itself is the city hall: a live map of the work, the Sydney context, the contact route, and the archive underneath it.",
    ...cityProjectPlots.portfolio,
    height: 2.3,
  }),
];

const cityItemIds = new Set(cityItems.map((item) => item.id));

function layoutArchiveZoneProjects(
  items: Project[],
  center: MapPoint,
  columns: number,
  spacingX: number,
  spacingZ: number,
  mapKind: "graveyard" | "learning",
) {
  const rowCount = Math.max(1, Math.ceil(items.length / columns));
  return items.map((project, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      ...project,
      mapKind,
      x: center.x + (column - (columns - 1) / 2) * spacingX,
      z: center.z + (row - (rowCount - 1) / 2) * spacingZ,
      height: mapKind === "learning" ? 0.95 + (index % 3) * 0.1 : 0.74 + (index % 4) * 0.06,
    };
  });
}

const graveyardProjects = projects.filter((project) => !cityItemIds.has(project.id) && project.tier !== "learning");
const learningCentreProjects = projects.filter((project) => !cityItemIds.has(project.id) && project.tier === "learning");
const graveyardMapItems = layoutArchiveZoneProjects(
  graveyardProjects,
  archiveDistricts.graveyard.center,
  4,
  2.15,
  1.72,
  "graveyard",
);
const learningCentreMapItems = layoutArchiveZoneProjects(
  learningCentreProjects,
  archiveDistricts.learningCentre.center,
  5,
  1.72,
  1.58,
  "learning",
);
const mapItems = [...cityItems, ...graveyardMapItems, ...learningCentreMapItems];
const mapItemIds = new Set(mapItems.map((item) => item.id));
const selectableItems = [
  ...mapItems,
  ...projects.filter((project) => !mapItemIds.has(project.id)),
];
const mapShortcutButtons = [
  ...landmarkButtons,
  {
    id: graveyardMapItems[0]?.id ?? cityItems[0].id,
    label: "Graveyard",
    Icon: Landmark,
  },
  {
    id: learningCentreMapItems[0]?.id ?? cityItems[0].id,
    label: "Learning Centre",
    Icon: Building2,
  },
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
  [String(mapItems.length), "map stops"],
  [String(projects.length), "archive items"],
  ["2026", "Moriah College grad"],
];

const filters = ["All", "Product", "Game", "Mobile", "Data story", "Learning"] as const;
const PLAYER_BALL_RADIUS = 0.36;
const PLAYER_SPEED = 11.2;
const PLAYER_BOUNDS = {
  minX: -27.2 + PLAYER_BALL_RADIUS,
  maxX: 33.0 - PLAYER_BALL_RADIUS,
  minZ: -26.6 + PLAYER_BALL_RADIUS,
  maxZ: 24.9 - PLAYER_BALL_RADIUS,
};
const MOVEMENT_KEYS = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
type CityRouteKind = "road" | "rail" | "bridge";
type CityRoute = {
  start: MapPoint;
  end: MapPoint;
  width: number;
  kind: CityRouteKind;
  walkWidth?: number;
};

const cityRoutes: CityRoute[] = [
  { start: sydneyPlaces.northSydney, end: sydneyPlaces.milsonsPoint, width: 0.36, walkWidth: 1.48, kind: "road" },
  { start: sydneyPlaces.milsonsPoint, end: sydneyPlaces.kirribilli, width: 0.28, walkWidth: 1.24, kind: "road" },
  { start: sydneyPlaces.milsonsPoint, end: sydneyPlaces.harbourBridge, width: 0.58, walkWidth: 2.08, kind: "bridge" },
  { start: sydneyPlaces.northSydney, end: sydneyPlaces.milsonsPoint, width: 0.13, kind: "rail" },
  { start: sydneyPlaces.milsonsPoint, end: sydneyPlaces.harbourBridge, width: 0.13, kind: "rail" },
  { start: sydneyPlaces.harbourBridge, end: sydneyPlaces.operaHouse, width: 0.54, walkWidth: 1.9, kind: "bridge" },
  { start: sydneyPlaces.operaHouse, end: sydneyPlaces.cbd, width: 0.38, walkWidth: 1.26, kind: "road" },
  { start: sydneyPlaces.cbd, end: sydneyPlaces.blackbird, width: 0.34, walkWidth: 1.18, kind: "road" },
  { start: sydneyPlaces.blackbird, end: sydneyPlaces.eveleigh, width: 0.32, walkWidth: 1.18, kind: "road" },
  { start: sydneyPlaces.cbd, end: sydneyPlaces.bondiJunction, width: 0.36, walkWidth: 1.12, kind: "road" },
  { start: sydneyPlaces.bondiJunction, end: sydneyPlaces.queensPark, width: 0.32, walkWidth: 1.08, kind: "road" },
  { start: sydneyPlaces.queensPark, end: sydneyPlaces.sportsField, width: 0.3, walkWidth: 1.04, kind: "road" },
  { start: sydneyPlaces.bondiJunction, end: sydneyPlaces.doverHeights, width: 0.3, walkWidth: 1.04, kind: "road" },
  { start: sydneyPlaces.doverHeights, end: sydneyPlaces.bondiBeach, width: 0.28, walkWidth: 1.02, kind: "road" },
  { start: sydneyPlaces.bondiJunction, end: sydneyPlaces.bondiBeach, width: 0.28, walkWidth: 1.02, kind: "road" },
  { start: sydneyPlaces.centralStation, end: sydneyPlaces.eveleigh, width: 0.16, kind: "rail" },
  { start: sydneyPlaces.blackbird, end: cityProjectPlots.whatsappWrapped, width: 0.3, walkWidth: 1.18, kind: "road" },
  { start: sydneyPlaces.bondiJunction, end: cityProjectPlots.jashby, width: 0.3, walkWidth: 1.14, kind: "road" },
  { start: sydneyPlaces.eveleigh, end: cityProjectPlots.quantium, width: 0.3, walkWidth: 1.14, kind: "road" },
  { start: sydneyPlaces.doverHeights, end: cityProjectPlots.doverHome, width: 0.26, walkWidth: 1.02, kind: "road" },
  { start: sydneyPlaces.bondiBeach, end: cityProjectPlots.bondiBeach, width: 0.26, walkWidth: 1.02, kind: "road" },
  { start: sydneyPlaces.operaHouse, end: cityProjectPlots.sydneyHarbour, width: 0.3, walkWidth: 1.12, kind: "road" },
  { start: sydneyPlaces.doverHeights, end: cityProjectPlots.carLifestory, width: 0.28, walkWidth: 1.06, kind: "road" },
  { start: sydneyPlaces.sportsField, end: cityProjectPlots.whatThePuck, width: 0.28, walkWidth: 1.06, kind: "road" },
  { start: sydneyPlaces.queensPark, end: cityProjectPlots.moriahJiuJitsu, width: 0.28, walkWidth: 1.06, kind: "road" },
  { start: sydneyPlaces.centralStation, end: cityProjectPlots.degree6, width: 0.28, walkWidth: 1.06, kind: "road" },
  { start: sydneyPlaces.queensPark, end: cityProjectPlots.ideaAid, width: 0.28, walkWidth: 1.06, kind: "road" },
  { start: sydneyPlaces.cbd, end: cityProjectPlots.portfolio, width: 0.3, walkWidth: 1.14, kind: "road" },
  { start: sydneyPlaces.northSydney, end: archiveDistricts.graveyard.entry, width: 0.28, walkWidth: 1.24, kind: "road" },
  { start: archiveDistricts.graveyard.entry, end: archiveDistricts.graveyard.center, width: 0.24, walkWidth: 1.16, kind: "road" },
  { start: sydneyPlaces.sportsField, end: archiveDistricts.learningCentre.entry, width: 0.28, walkWidth: 1.2, kind: "road" },
  { start: archiveDistricts.learningCentre.entry, end: archiveDistricts.learningCentre.center, width: 0.24, walkWidth: 1.12, kind: "road" },
];

const cityNavigationNodes = [
  ...Object.values(cityProjectPlots),
  archiveDistricts.graveyard.entry,
  archiveDistricts.graveyard.center,
  archiveDistricts.learningCentre.entry,
  archiveDistricts.learningCentre.center,
  sydneyPlaces.northSydney,
  sydneyPlaces.milsonsPoint,
  sydneyPlaces.kirribilli,
  sydneyPlaces.harbourBridge,
  sydneyPlaces.operaHouse,
  sydneyPlaces.cbd,
  sydneyPlaces.blackbird,
  sydneyPlaces.eveleigh,
  sydneyPlaces.centralStation,
  sydneyPlaces.bondiJunction,
  sydneyPlaces.queensPark,
  sydneyPlaces.sportsField,
  sydneyPlaces.doverHeights,
  sydneyPlaces.bondiBeach,
];

function findWalkableRoute(start: MapPoint, destination: MapPoint, areas: MapPoint[][], radius: number) {
  if (!pointInWalkableAreasWithRadius(destination.x, destination.z, areas, radius)) return null;

  const nodes = [start, ...cityNavigationNodes, destination];
  const destinationIndex = nodes.length - 1;
  const distances = nodes.map(() => Number.POSITIVE_INFINITY);
  const previous = nodes.map(() => -1);
  const visited = nodes.map(() => false);
  distances[0] = 0;

  for (let step = 0; step < nodes.length; step += 1) {
    let current = -1;
    let currentDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < nodes.length; index += 1) {
      if (!visited[index] && distances[index] < currentDistance) {
        current = index;
        currentDistance = distances[index];
      }
    }
    if (current === -1 || current === destinationIndex) break;

    visited[current] = true;
    for (let next = 0; next < nodes.length; next += 1) {
      if (visited[next] || next === current) continue;
      if (!segmentInWalkableAreas(nodes[current], nodes[next], areas, radius)) continue;
      const edgeDistance = Math.hypot(nodes[current].x - nodes[next].x, nodes[current].z - nodes[next].z);
      const candidateDistance = currentDistance + edgeDistance;
      if (candidateDistance < distances[next]) {
        distances[next] = candidateDistance;
        previous[next] = current;
      }
    }
  }

  if (previous[destinationIndex] === -1) return null;

  const route: MapPoint[] = [];
  for (let index = destinationIndex; index !== 0; index = previous[index]) {
    route.unshift(nodes[index]);
  }
  return route;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

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
        ctx.fillRect((i * 97 + (i % 19) * 37) % 512, (i * 193 + (i % 17) * 29) % 512, 2, 2);
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

function addFlatShape(
  parent: THREE.Object3D,
  points: MapPoint[],
  materialOrColor: THREE.Material | string,
  y = 0,
  materialParameters: THREE.MeshStandardMaterialParameters = {},
) {
  const material =
    typeof materialOrColor === "string" ? modelMaterial(materialOrColor, materialParameters) : materialOrColor;
  const shape = new THREE.Shape(points.map((point) => new THREE.Vector2(point.x, -point.z)));
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addFlatDisc(
  parent: THREE.Object3D,
  radius: number,
  materialOrColor: THREE.Material | string,
  position: MapPoint,
  y = 0,
  scale: [number, number] = [1, 1],
  segments = 40,
) {
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(scale[0], scale[1], 1);
  mesh.position.set(position.x, y, position.z);
  mesh.receiveShadow = true;
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
  if (project.mapKind === "graveyard") return createGraveyardProjectModel(project);
  if (project.mapKind === "learning") return createLearningProjectModel(project);
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

function stableProjectNumber(project: Project) {
  return project.id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function createGraveyardProjectModel(project: Project) {
  const group = new THREE.Group();
  const seed = stableProjectNumber(project);
  const stone = modelMaterial(seed % 2 ? "#7d8178" : "#686f68", { roughness: 0.88 });
  const accent = modelMaterial(project.color, { roughness: 0.62, metalness: 0.04 });
  const tilt = ((seed % 7) - 3) * 0.025;

  addBox(group, [0.52, project.height, 0.2], stone, [0, project.height / 2, 0], [0, tilt, 0]);
  addCylinder(group, 0.26, 0.26, 0.21, stone, [0, project.height + 0.02, 0], [Math.PI / 2, 0, tilt], 24);
  addBox(group, [0.68, 0.08, 0.28], "#30342f", [0, 0.06, 0.02], [0, tilt, 0]);
  addBox(group, [0.26, 0.035, 0.045], accent, [0, project.height * 0.56, -0.13], [0, tilt, 0]);
  addBox(group, [0.035, 0.22, 0.045], accent, [0, project.height * 0.56, -0.13], [0, tilt, 0]);
  addBox(group, [0.42, 0.035, 0.08], "#d8dacb", [0, 0.27, -0.14], [0, tilt, 0]);

  if (seed % 3 === 0) {
    addBox(group, [0.54, 0.04, 0.62], "#20251f", [0.36, 0.08, 0.36], [0, 0.45, 0]);
    addBox(group, [0.34, 0.035, 0.44], project.color, [0.36, 0.13, 0.36], [0, 0.45, 0]);
  }
  return group;
}

function createLearningProjectModel(project: Project) {
  const group = new THREE.Group();
  const seed = stableProjectNumber(project);
  const desk = modelMaterial("#d7c49b", { roughness: 0.78 });
  const screen = modelMaterial("#1b2628", { roughness: 0.44, metalness: 0.08 });
  const glow = new THREE.MeshBasicMaterial({ color: project.color });

  addBox(group, [0.72, 0.08, 0.5], desk, [0, 0.22, 0]);
  addBox(group, [0.12, 0.32, 0.08], desk, [-0.26, 0.08, 0.12]);
  addBox(group, [0.12, 0.32, 0.08], desk, [0.26, 0.08, 0.12]);
  addBox(group, [0.46, 0.34, 0.06], screen, [0, 0.48, -0.18], [0.18, 0, 0]);
  addBox(group, [0.34, 0.2, 0.065], glow, [0, 0.49, -0.22], [0.18, 0, 0]);
  addBox(group, [0.32, 0.035, 0.2], seed % 2 ? "#fffdf4" : "#f7d35f", [-0.38, 0.3, 0.18], [0, -0.24, 0]);
  addBox(group, [0.28, 0.035, 0.18], seed % 2 ? "#4cbad8" : "#fffdf4", [-0.38, 0.35, 0.2], [0, -0.24, 0]);
  addSphere(group, 0.11, "#fff8dc", [0.38, 0.48, 0.1], 18);
  addCone(group, 0.18, 0.12, 4, project.color, [0.38, 0.61, 0.1], [0, Math.PI / 4, 0]);
  return group;
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
  const card = modelMaterial("#fffdf4", { roughness: 0.48 });
  addBox(group, [1.9, project.height, 1.28], dark, [0, project.height / 2, 0]);
  addBox(group, [0.24, project.height * 0.86, 1.38], green, [0.95, project.height * 0.43, 0]);
  addBox(group, [2.08, 0.16, 1.48], "#fff8dc", [0, project.height + 0.08, 0]);
  addFacadeGrid(group, 1.9, project.height, 1.28, 7, 3, "#83f6aa", 0.75);
  [
    [-0.36, 1.18, 0.86, 0.34],
    [0.26, 2.05, 0.76, 0.3],
    [-0.2, 2.92, 1.02, 0.36],
  ].forEach(([x, y, width, height], index) => {
    [-0.69, 0.69].forEach((z) => {
      addBox(group, [width, height, 0.07], card, [x, y, z]);
      addBox(group, [0.16, 0.12, 0.075], index % 2 === 0 ? green : "#101611", [x - width / 2 + 0.12, y - height / 2 - 0.08, z], [0, 0, -0.5]);
    });
  });
  addBox(group, [1.42, 0.08, 0.88], card, [-1.18, 0.28, 1.02], [0, -0.18, 0]);
  addBox(group, [1.02, 0.06, 0.1], green, [-1.24, 0.36, 0.72], [0, -0.18, 0]);
  [0.22, 0.42, 0.72, 0.48].forEach((height, index) => {
    addBox(group, [0.14, height, 0.12], index % 2 ? "#83f6aa" : green, [-1.72 + index * 0.28, 0.34 + height / 2, 1.08], [0, -0.18, 0]);
  });
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: "#83f6aa", transparent: true, opacity: 0.72 });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.025, 8, 72), orbitMaterial);
  orbit.rotation.set(Math.PI / 2, 0, -0.22);
  orbit.position.set(0.02, project.height + 0.15, 0);
  group.add(orbit);
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
  const cellMaterial = new THREE.MeshBasicMaterial({ color: "#dffff0" });
  for (let col = 0; col < 6; col += 1) {
    addBox(group, [0.022, 0.03, 1.24], lineMaterial, [-0.9 + col * 0.34, 0.39, 0.95]);
  }
  for (let row = 0; row < 4; row += 1) {
    addBox(group, [2.18, 0.028, 0.026], lineMaterial, [0, 0.28 + row * 0.16, 0.32]);
  }
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if ((row + col) % 2 === 0) {
        addBox(group, [0.22, 0.024, 0.16], cellMaterial, [-0.74 + col * 0.36, 0.5 + row * 0.18, 0.68], [0, 0, 0]);
      }
    }
  }
  addCylinder(group, 0.32, 0.32, 0.1, "#f7d35f", [-1.22, 1.02, -0.68], [Math.PI / 2, 0, 0], 32);
  addBox(group, [0.56, 0.06, 0.12], "#fffdf4", [-1.22, 1.03, -0.68], [0, 0, 0.25]);
  addBox(group, [0.12, 0.06, 0.56], "#fffdf4", [-1.22, 1.03, -0.68], [0, 0, 0.25]);
  addBox(group, [0.16, 0.82, 0.12], "#f7d35f", [0.72, project.height + 0.56, 0.02]);
  return group;
}

function createQuantiumModel(project: Project) {
  const group = new THREE.Group();
  const glass = modelMaterial("#2f8ec7", { roughness: 0.2, metalness: 0.18 });
  addBox(group, [1.68, project.height, 1.68], glass, [0, project.height / 2, 0]);
  addBox(group, [1.92, 0.18, 1.92], "#d9eff7", [0, project.height + 0.09, 0]);
  addBox(group, [0.22, project.height * 0.9, 1.76], "#17476c", [-0.96, project.height * 0.45, 0]);
  addBox(group, [1.08, 0.08, 1.35], "#101a22", [1.08, 0.42, -0.18], [0, 0.22, 0], { roughness: 0.4, metalness: 0.12 });
  const dotMaterial = new THREE.MeshBasicMaterial({ color: "#aee7ff" });
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const active = (row + col) % 3 !== 0;
      [-0.86, 0.86].forEach((z) => {
        addBox(group, [0.11, 0.11, 0.028], active ? dotMaterial : "#0c3654", [-0.54 + col * 0.36, 0.78 + row * 0.34, z]);
      });
    }
  }
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const color = ["#17476c", "#2f8ec7", "#aee7ff", "#f7d35f"][(row + col) % 4];
      addBox(group, [0.16, 0.035, 0.12], color, [0.7 + col * 0.24, 0.5, -0.68 + row * 0.22], [0, 0.22, 0]);
    }
  }
  [0.42, 0.74, 1.08].forEach((height, index) => {
    addBox(group, [0.22, height, 0.22], project.color, [0.38 + index * 0.28, project.height + height / 2 + 0.18, -0.38]);
  });
  const dataOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.26, 0.022, 8, 72),
    new THREE.MeshBasicMaterial({ color: "#aee7ff", transparent: true, opacity: 0.68 }),
  );
  dataOrbit.rotation.set(Math.PI / 2, 0.28, 0.15);
  dataOrbit.position.set(0.04, project.height + 0.12, 0.02);
  group.add(dataOrbit);
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
  const graphFloorPoints = [
    new THREE.Vector3(-0.9, 0.28, 0.86),
    new THREE.Vector3(-0.2, 0.36, 1.02),
    new THREE.Vector3(0.62, 0.32, 0.72),
    new THREE.Vector3(1.04, 0.42, -0.28),
    new THREE.Vector3(-0.72, 0.38, -0.82),
  ];
  graphFloorPoints.forEach((point, index) => {
    addSphere(group, 0.1 + (index % 2) * 0.035, index === 1 ? "#fff8dc" : nodeMaterial, [point.x, point.y, point.z], 18);
    if (index > 0) addCylinderBetween(group, graphFloorPoints[index - 1], point, 0.018, lineMaterial);
  });
  addCylinder(group, 0.34, 0.34, 0.045, "#fff8dc", [0.95, 1.24, -0.96], [Math.PI / 2, 0, 0], 32);
  addCylinder(group, 0.24, 0.24, 0.05, "#171925", [0.95, 1.25, -0.96], [Math.PI / 2, 0, 0], 32);
  addBox(group, [0.08, 0.08, 0.52], "#fff8dc", [1.2, 1.05, -0.72], [0.45, 0, -0.55]);
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
  addBox(group, [2.55, 0.12, 1.92], "#252825", [0, 0.06, 0.15]);
  addBox(group, [2.28, 0.92, 0.84], "#f5ead0", [0, 0.52, -0.54]);
  addBox(group, [2.48, 0.16, 0.98], project.color, [0, 1.06, -0.54], [0, 0, 0], { roughness: 0.45 });
  [-0.72, -0.24, 0.24, 0.72].forEach((x) => {
    addBox(group, [0.24, 0.28, 0.04], "#94d8e8", [x, 0.64, -0.98]);
  });
  addBox(group, [1.03, 0.045, 1.3], "#2f68c8", [-0.52, 0.18, 0.52]);
  addBox(group, [1.03, 0.045, 1.3], project.color, [0.52, 0.18, 0.52]);
  addBox(group, [1.62, 0.7, 0.12], "#fffdf4", [0, 0.64, 1.28]);
  addBox(group, [0.56, 0.3, 0.14], "#151713", [-0.42, 0.7, 1.36]);
  addBox(group, [0.56, 0.3, 0.14], "#151713", [0.42, 0.7, 1.36]);
  addBox(group, [0.38, 0.065, 0.16], "#2f68c8", [-0.42, 0.74, 1.44]);
  addBox(group, [0.38, 0.065, 0.16], project.color, [0.42, 0.74, 1.44]);
  addBox(group, [0.08, 0.78, 0.08], "#1d201d", [-1.16, 0.5, 1.18]);
  addBox(group, [0.08, 0.78, 0.08], "#1d201d", [1.16, 0.5, 1.18]);
  return group;
}

function createIdeaAidModel(project: Project) {
  const group = new THREE.Group();
  addBox(group, [1.92, 1.18, 1.42], "#ede0c6", [0, 0.59, 0]);
  addBox(group, [2.14, 0.2, 1.62], project.color, [0, 1.28, 0], [0, 0, 0], { roughness: 0.38, metalness: 0.08 });
  addBox(group, [0.52, 0.58, 0.07], "#242225", [-0.44, 0.56, -0.74]);
  addBox(group, [0.52, 0.58, 0.07], "#fffdf4", [0.44, 0.56, -0.74]);
  addBox(group, [1.52, 0.08, 0.9], "#242225", [0.02, 0.22, 1.05], [0, -0.12, 0], { roughness: 0.42, metalness: 0.16 });
  addBox(group, [1.18, 0.045, 0.64], "#fffdf4", [0.02, 0.3, 1.05], [0, -0.12, 0], { roughness: 0.5 });
  ["#22d66f", "#2f8ec7", "#f7d35f"].forEach((color, index) => {
    addBox(group, [0.52 - index * 0.08, 0.035, 0.045], color, [-0.28 + index * 0.08, 0.35 + index * 0.09, 0.78 + index * 0.12], [0, -0.12, 0]);
  });
  addSphere(group, 0.36, "#f7d35f", [0, 1.93, 0], 32);
  addCylinder(group, 0.17, 0.21, 0.22, "#755f38", [0, 1.48, 0], [0, 0, 0], 18);
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    addBox(group, [0.05, 0.26, 0.05], "#f7d35f", [Math.cos(angle) * 0.62, 1.94 + Math.sin(angle) * 0.12, Math.sin(angle) * 0.62], [0, angle, 0.4]);
  }
  [
    new THREE.Vector3(-0.5, 1.38, 0.55),
    new THREE.Vector3(0.5, 1.38, 0.55),
    new THREE.Vector3(-0.7, 1.2, -0.38),
    new THREE.Vector3(0.7, 1.2, -0.38),
  ].forEach((point) => addCylinderBetween(group, new THREE.Vector3(0, 1.74, 0), point, 0.018, "#ffe9a6"));
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
  addBox(group, [3.35, 0.16, 1.98], "#e8d9b6", [0, 0.08, 0.18]);
  addBox(group, [2.86, 0.12, 1.44], "#d4bd92", [0.1, 0.22, 0.03]);
  const shellMaterial = modelMaterial("#fff8e6", { roughness: 0.28, metalness: 0.03 });
  const ribMaterial = new THREE.MeshBasicMaterial({ color: "#d9d0bc" });
  [
    [-1.02, 0.74, -0.38, -0.22, 1.08],
    [-0.52, 0.9, -0.28, -0.08, 1.18],
    [0.02, 1.04, -0.2, 0.04, 1.28],
    [0.56, 0.94, -0.08, 0.15, 1.16],
    [1.05, 0.78, 0.08, 0.28, 1.02],
  ].forEach(([x, height, z, rotation, radius], index) => {
    addCone(group, radius * 0.38, height, 4, shellMaterial, [x, 0.44 + height / 2, z], [0.12, Math.PI / 4, rotation]);
    addBox(group, [0.035, height * 0.55, 0.035], ribMaterial, [x + 0.12, 0.58 + height * 0.24, z + 0.08], [0.14, index * 0.16, 0.32]);
  });
  for (let step = 0; step < 4; step += 1) {
    addBox(group, [2.6 - step * 0.32, 0.035, 0.1], "#c9b287", [0.08, 0.27 + step * 0.04, 1.0 + step * 0.16]);
  }
  addBox(group, [2.72, 0.045, 0.08], project.color, [0, 0.24, -1.02]);
  addBox(group, [2.2, 0.04, 0.12], "#4cbad8", [0.18, 0.2, 1.18], [0, -0.12, 0]);
  addBox(group, [0.9, 0.035, 0.1], "#4cbad8", [-1.02, 0.2, 1.02], [0, 0.26, 0]);
  return group;
}

function createBondiModel(project: Project) {
  const group = new THREE.Group();
  const sandMaterial = modelMaterial("#f0d79a", { roughness: 0.92 });
  const wetSandMaterial = modelMaterial("#d1b27a", { roughness: 0.9 });
  const waterMaterial = modelMaterial("#39a9bf", { roughness: 0.16, metalness: 0.05 });
  const promenadeMaterial = modelMaterial("#d8c494", { roughness: 0.72 });
  const poolWater = modelMaterial("#68d1e0", { roughness: 0.12, metalness: 0.06 });
  const foam = new THREE.MeshBasicMaterial({ color: "#fffdf4", transparent: true, opacity: 0.95 });
  const red = modelMaterial("#e6533f", { roughness: 0.52 });
  const yellow = modelMaterial("#f7d35f", { roughness: 0.52 });

  addFlatShape(group, [
    { x: -1.95, z: -1.15 },
    { x: -0.74, z: -1.48 },
    { x: 0.68, z: -1.36 },
    { x: 1.6, z: -0.86 },
    { x: 1.86, z: 0.22 },
    { x: 1.35, z: 1.23 },
    { x: 0.04, z: 1.56 },
    { x: -1.24, z: 1.22 },
    { x: -2.1, z: 0.34 },
  ], sandMaterial, 0.042);
  addFlatShape(group, [
    { x: 0.42, z: -1.42 },
    { x: 1.82, z: -1.08 },
    { x: 2.08, z: -0.18 },
    { x: 1.72, z: 0.74 },
    { x: 0.92, z: 1.14 },
    { x: 0.46, z: 0.6 },
    { x: 0.74, z: -0.24 },
  ], waterMaterial, 0.065);
  addFlatShape(group, [
    { x: 0.1, z: -1.26 },
    { x: 0.78, z: -1.16 },
    { x: 1.16, z: -0.72 },
    { x: 1.06, z: 0.08 },
    { x: 0.56, z: 0.76 },
    { x: 0.2, z: 0.5 },
    { x: 0.46, z: -0.22 },
  ], wetSandMaterial, 0.072);
  for (let i = 0; i < 7; i += 1) {
    addBox(
      group,
      [1.08 - i * 0.045, 0.03, 0.052],
      foam,
      [0.52 + i * 0.22, 0.13 + i * 0.004, -1.0 + i * 0.33],
      [0, -0.56 + i * 0.09, 0],
    );
  }

  addBox(group, [2.2, 0.1, 0.44], promenadeMaterial, [-1.0, 0.12, -0.96], [0, 0.1, 0]);
  addBox(group, [0.08, 0.32, 1.48], promenadeMaterial, [-1.82, 0.24, 0.06], [0, -0.18, 0]);

  addBox(group, [1.48, 0.58, 0.62], "#fff7df", [-1.12, 0.48, -0.58]);
  addBox(group, [1.66, 0.14, 0.74], "#4cbad8", [-1.12, 0.86, -0.58], [0, 0, 0], { roughness: 0.48 });
  addBox(group, [0.34, 0.44, 0.07], "#1c2322", [-1.12, 0.46, -0.94]);
  [-1.56, -0.72].forEach((x) => {
    addCylinder(group, 0.055, 0.055, 0.5, "#d9d0bc", [x, 0.48, -0.95], [0, 0, 0], 16);
    addBox(group, [0.19, 0.22, 0.075], "#94d8e8", [x, 0.58, -0.96]);
  });
  addBox(group, [1.74, 0.045, 0.08], project.color, [-1.12, 1.02, -0.95]);

  // Replace box pool with a round "Icebergs"-style pool: outer rim + inner water
  const pool = new THREE.Group();
  pool.position.set(1.18, 0, 0.72);
  pool.rotation.y = -0.34;
  // outer rim (white concrete)
  addCylinder(pool, 0.54, 0.58, 0.06, "#fffdf4", [0, 0.14, 0], [Math.PI / 2, 0, 0], 32);
  // inner water (slightly inset)
  addCylinder(pool, 0.46, 0.48, 0.04, poolWater, [0, 0.18, 0], [Math.PI / 2, 0, 0], 32);
  // small foam lines along inner edge (decor)
  for (let f = 0; f < 6; f += 1) {
    const angle = (f / 6) * Math.PI * 2;
    const fx = Math.cos(angle) * 0.44;
    const fz = Math.sin(angle) * 0.44;
    addBox(pool, [0.08, 0.008, 0.02], foam, [fx, 0.215, fz], [0, angle + 0.2, 0]);
  }
  // bench / step detail
  addBox(pool, [0.14, 0.03, 0.46], "#d8c494", [-0.55, 0.24, 0]);
  addBox(pool, [0.24, 0.045, 0.28], "#e8d9b6", [-0.78, 0.16, 0.24], [0, 0.16, 0]);
  group.add(pool);

  for (let step = 0; step < 4; step += 1) {
    addBox(group, [0.68 + step * 0.22, 0.055, 0.12], "#bda474", [1.38, 0.14 + step * 0.035, 1.12 + step * 0.16], [0, -0.32, 0]);
  }

  addBox(group, [0.56, 0.44, 0.46], "#fff4bd", [-1.4, 0.42, 0.62]);
  addBox(group, [0.68, 0.12, 0.54], red, [-1.4, 0.7, 0.62]);
  addBox(group, [0.11, 0.76, 0.1], red, [-1.66, 0.48, 0.62]);
  addBox(group, [0.11, 0.76, 0.1], red, [-1.14, 0.48, 0.62]);
  addBox(group, [0.5, 0.055, 0.08], yellow, [-1.4, 0.96, 0.62]);

  ([
    [-0.42, 0.16, "#f7d35f"],
    [0.1, 0.58, "#e6533f"],
    [-0.34, 0.94, "#2f8ec7"],
  ] as const).forEach(([x, z, color], index) => {
    addCylinder(group, 0.028, 0.028, 0.58, "#654b2f", [x, 0.4, z], [0, 0, 0], 12);
    addCone(group, 0.28, 0.18, 20, color, [x, 0.74, z], [0, index * 0.52, 0]);
  });
  ["#fff4bd", "#e6533f", "#2f8ec7", "#22d66f", "#f7d35f"].forEach((color, index) => {
    addBox(
      group,
      [0.22, 0.045, 0.82],
      color,
      [-0.72 + index * 0.31, 0.13, 0.94 - (index % 2) * 0.24],
      [0, -0.72 + index * 0.22, 0],
      { roughness: 0.54 },
    );
  });
  const patrolFlags: Array<[number, number, THREE.Material]> = [
    [-0.92, -0.18, red],
    [-0.18, -0.2, yellow],
  ];
  patrolFlags.forEach(([x, z, material], index) => {
    addCylinder(group, 0.025, 0.025, 0.66, "#151713", [x, 0.44, z], [0, 0, 0], 10);
    addBox(group, [0.26, 0.18, 0.035], material, [x, 0.72, z], [0, 0.24 + index * 0.2, 0]);
  });
  return group;
}

function createDoverHomeModel(project: Project) {
  const group = new THREE.Group();
  [-0.7, -0.2, 0.34, 0.88].forEach((x, index) => {
    addBox(group, [0.82, 0.42 + index * 0.08, 1.18], "#bda474", [x, 0.21 + index * 0.04, -0.08 + index * 0.22], [0, -0.16, 0]);
  });
  addBox(group, [1.52, 0.78, 1.06], "#fff2cf", [0.08, 0.86, -0.04]);
  addBox(group, [1.76, 0.16, 1.24], project.color, [0.08, 1.34, -0.04], [0, 0, 0], { roughness: 0.46 });
  addBox(group, [1.7, 0.06, 0.16], "#151713", [0.08, 1.46, -0.7]);
  addBox(group, [0.78, 0.36, 0.06], "#94d8e8", [0.0, 0.9, -0.6]);
  addBox(group, [0.36, 0.26, 0.06], "#94d8e8", [-0.54, 0.92, -0.6]);
  addBox(group, [0.36, 0.26, 0.06], "#94d8e8", [0.54, 0.92, -0.6]);
  addBox(group, [0.74, 0.08, 0.82], "#d9d0bc", [0.94, 0.56, -0.3], [0, 0.28, 0]);
  addBox(group, [1.34, 0.05, 0.36], "#176b82", [-0.78, 0.2, 0.9], [0, -0.2, 0], { roughness: 0.2, metalness: 0.04 });
  addCylinder(group, 0.035, 0.035, 0.72, "#151713", [-1.22, 0.56, 0.95], [0, 0, 0], 12);
  addCylinder(group, 0.18, 0.1, 0.18, "#f7d35f", [-1.22, 0.96, 0.95], [0, 0, 0], 24);
  addBox(group, [0.84, 0.04, 0.1], "#fffdf4", [-1.22, 0.67, 0.95], [0, 0.35, 0]);
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
  const [webglUnavailable, setWebglUnavailable] = useState(false);
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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      let disposed = false;
      const fallbackTimer = window.setTimeout(() => {
        if (!disposed) setWebglUnavailable(true);
      }, 0);
      return () => {
        disposed = true;
        window.clearTimeout(fallbackTimer);
      };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    // Slightly brighter sky-blue background and extended fog for depth
    scene.background = new THREE.Color("#bfe9ff");
    scene.fog = new THREE.Fog("#bfe9ff", 46, 120);

    // Wider field of view for a more panoramic city feel
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 190);
    camera.position.set(10.0, 14.0, 16.0);

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

    const parkMaterial = new THREE.MeshStandardMaterial({ color: "#4f8d55", map: grass, roughness: 0.84 });
    const scrubMaterial = new THREE.MeshStandardMaterial({ color: "#6f9a55", map: grass, roughness: 0.9 });
    const inlandMaterial = new THREE.MeshStandardMaterial({ color: "#3f7149", map: grass, roughness: 0.88 });
    const waterMaterial = new THREE.MeshStandardMaterial({ color: "#176b82", map: water, roughness: 0.22, metalness: 0.08 });
    const harbourMaterial = new THREE.MeshStandardMaterial({ color: "#267a90", map: water, roughness: 0.24, metalness: 0.06 });
    const sandMaterial = new THREE.MeshStandardMaterial({ color: "#e4c875", map: sand, roughness: 0.88 });
    const districtMaterial = new THREE.MeshStandardMaterial({ color: "#2c302b", map: road, roughness: 0.72 });
    const lightDistrictMaterial = new THREE.MeshStandardMaterial({ color: "#514d45", map: road, roughness: 0.76 });
    const pitchMaterial = new THREE.MeshStandardMaterial({ color: "#2c8d4a", map: pitch, roughness: 0.86 });
    const promenadeMaterial = new THREE.MeshStandardMaterial({ color: "#d5c7a6", roughness: 0.75 });
    const projectPlotMaterial = new THREE.MeshStandardMaterial({ color: "#3c4039", map: road, roughness: 0.78 });
    const landmarkPlotMaterial = new THREE.MeshStandardMaterial({ color: "#cfbd91", roughness: 0.82 });
    const graveyardMaterial = new THREE.MeshStandardMaterial({ color: "#273027", map: grass, roughness: 0.92 });
    const learningCampusMaterial = new THREE.MeshStandardMaterial({ color: "#435c58", map: road, roughness: 0.78 });

    const mainLandShape = [
      { x: -15.1, z: -9.15 },
      { x: -12.35, z: -10.25 },
      { x: -8.65, z: -9.55 },
      { x: -6.35, z: -10.55 },
      { x: -4.35, z: -9.15 },
      { x: -2.7, z: -10.75 },
      { x: 0.15, z: -9.05 },
      { x: 1.05, z: -6.35 },
      { x: 4.55, z: -4.05 },
      { x: 8.7, z: -1.95 },
      { x: 13.1, z: -7.35 },
      { x: 18.55, z: -8.85 },
      { x: 25.8, z: -7.85 },
      { x: 29.45, z: -5.25 },
      { x: 28.15, z: -0.2 },
      { x: 23.05, z: 4.9 },
      { x: 15.15, z: 8.2 },
      { x: 8.65, z: 10.75 },
      { x: 1.25, z: 10.7 },
      { x: -5.25, z: 9.35 },
      { x: -11.95, z: 5.35 },
      { x: -15.25, z: 0.35 },
    ];
    const inlandSuburbsShape = [
      { x: -22.45, z: 2.95 },
      { x: -15.45, z: 2.85 },
      { x: -8.75, z: 5.5 },
      { x: -1.2, z: 6.95 },
      { x: 6.85, z: 6.8 },
      { x: 13.3, z: 5.62 },
      { x: 21.4, z: 3.85 },
      { x: 27.2, z: 6.15 },
      { x: 31.7, z: 10.8 },
      { x: 32.55, z: 18.8 },
      { x: 27.75, z: 24.0 },
      { x: 14.0, z: 23.2 },
      { x: 2.3, z: 20.8 },
      { x: -9.2, z: 15.05 },
      { x: -21.95, z: 12.05 },
    ];
    const harbourWaterShape = [
      { x: -15.5, z: -15.45 },
      { x: 4.65, z: -15.45 },
      { x: 4.35, z: -11.95 },
      { x: 0.55, z: -10.72 },
      { x: -2.3, z: -11.34 },
      { x: -4.05, z: -9.85 },
      { x: -6.45, z: -10.34 },
      { x: -8.35, z: -9.28 },
      { x: -10.7, z: -10.08 },
      { x: -15.5, z: -10.45 },
    ];
    const northShoreShape = [
      { x: sydneyPlaces.northSydney.x - 10.9, z: sydneyPlaces.northSydney.z - 6.2 },
      { x: sydneyPlaces.northSydney.x - 5.45, z: sydneyPlaces.northSydney.z - 7.45 },
      { x: sydneyPlaces.northSydney.x + 2.9, z: sydneyPlaces.northSydney.z - 6.95 },
      { x: sydneyPlaces.northSydney.x + 8.2, z: sydneyPlaces.northSydney.z - 4.3 },
      { x: sydneyPlaces.kirribilli.x + 9.25, z: sydneyPlaces.kirribilli.z - 2.35 },
      { x: sydneyPlaces.kirribilli.x + 7.4, z: sydneyPlaces.kirribilli.z + 1.75 },
      { x: sydneyPlaces.harbourBridge.x + 5.35, z: sydneyPlaces.harbourBridge.z + 1.24 },
      { x: sydneyPlaces.harbourBridge.x + 2.1, z: sydneyPlaces.harbourBridge.z + 0.54 },
      { x: sydneyPlaces.harbourBridge.x - 2.55, z: sydneyPlaces.harbourBridge.z + 0.38 },
      { x: sydneyPlaces.milsonsPoint.x - 5.75, z: sydneyPlaces.milsonsPoint.z + 1.62 },
      { x: sydneyPlaces.northSydney.x - 10.25, z: sydneyPlaces.northSydney.z - 0.45 },
    ];
    const northArchiveHeadlandShape = [
      { x: archiveDistricts.graveyard.center.x - 7.1, z: archiveDistricts.graveyard.center.z - 4.55 },
      { x: archiveDistricts.graveyard.center.x - 1.6, z: archiveDistricts.graveyard.center.z - 6.15 },
      { x: sydneyPlaces.northSydney.x - 2.4, z: sydneyPlaces.northSydney.z - 2.4 },
      { x: sydneyPlaces.northSydney.x + 0.6, z: sydneyPlaces.northSydney.z + 0.3 },
      { x: archiveDistricts.graveyard.entry.x + 1.8, z: archiveDistricts.graveyard.entry.z + 2.15 },
      { x: archiveDistricts.graveyard.center.x + 6.4, z: archiveDistricts.graveyard.center.z + 4.55 },
      { x: archiveDistricts.graveyard.center.x - 7.1, z: archiveDistricts.graveyard.center.z + 4.95 },
    ];
    const lavenderBayShape = [
      { x: sydneyPlaces.milsonsPoint.x - 5.45, z: sydneyPlaces.milsonsPoint.z + 1.58 },
      { x: sydneyPlaces.milsonsPoint.x - 3.45, z: sydneyPlaces.milsonsPoint.z + 0.56 },
      { x: sydneyPlaces.milsonsPoint.x - 0.8, z: sydneyPlaces.milsonsPoint.z + 0.82 },
      { x: sydneyPlaces.milsonsPoint.x - 1.15, z: sydneyPlaces.milsonsPoint.z + 2.38 },
      { x: sydneyPlaces.milsonsPoint.x - 3.92, z: sydneyPlaces.milsonsPoint.z + 2.98 },
    ];
    const kirribilliHeadlandShape = [
      { x: sydneyPlaces.kirribilli.x - 0.5, z: sydneyPlaces.kirribilli.z - 0.1 },
      { x: sydneyPlaces.kirribilli.x + 4.8, z: sydneyPlaces.kirribilli.z - 0.42 },
      { x: sydneyPlaces.kirribilli.x + 5.55, z: sydneyPlaces.kirribilli.z + 1.65 },
      { x: sydneyPlaces.kirribilli.x + 2.1, z: sydneyPlaces.kirribilli.z + 2.95 },
      { x: sydneyPlaces.kirribilli.x - 0.85, z: sydneyPlaces.kirribilli.z + 1.9 },
    ];
    const bondiSandShape = [
      { x: sydneyPlaces.bondiBeach.x - 1.75, z: sydneyPlaces.bondiBeach.z - 1.85 },
      { x: sydneyPlaces.bondiBeach.x + 2.45, z: sydneyPlaces.bondiBeach.z - 1.05 },
      { x: sydneyPlaces.bondiBeach.x + 2.15, z: sydneyPlaces.bondiBeach.z + 2.8 },
      { x: sydneyPlaces.bondiBeach.x - 1.35, z: sydneyPlaces.bondiBeach.z + 2.65 },
      { x: sydneyPlaces.bondiBeach.x - 2.1, z: sydneyPlaces.bondiBeach.z + 0.85 },
    ];
    const operaPromenadeShape = [
      { x: sydneyPlaces.operaHouse.x - 3.45, z: sydneyPlaces.operaHouse.z + 0.15 },
      { x: sydneyPlaces.operaHouse.x + 3.55, z: sydneyPlaces.operaHouse.z + 0.48 },
      { x: sydneyPlaces.operaHouse.x + 3.1, z: sydneyPlaces.operaHouse.z + 2.15 },
      { x: sydneyPlaces.operaHouse.x - 2.7, z: sydneyPlaces.operaHouse.z + 2.05 },
    ];
    const northSydneyDistrictShape = [
      { x: sydneyPlaces.northSydney.x - 4.75, z: sydneyPlaces.northSydney.z - 3.2 },
      { x: sydneyPlaces.northSydney.x + 4.9, z: sydneyPlaces.northSydney.z - 2.8 },
      { x: sydneyPlaces.northSydney.x + 4.35, z: sydneyPlaces.northSydney.z + 1.9 },
      { x: sydneyPlaces.northSydney.x - 5.1, z: sydneyPlaces.northSydney.z + 1.55 },
    ];
    const milsonsPromenadeShape = [
      { x: sydneyPlaces.milsonsPoint.x - 3.65, z: sydneyPlaces.milsonsPoint.z + 0.4 },
      { x: sydneyPlaces.milsonsPoint.x + 3.45, z: sydneyPlaces.milsonsPoint.z + 0.5 },
      { x: sydneyPlaces.kirribilli.x + 3.25, z: sydneyPlaces.kirribilli.z + 2.15 },
      { x: sydneyPlaces.milsonsPoint.x - 3.45, z: sydneyPlaces.milsonsPoint.z + 2.0 },
    ];
    const graveyardShape = [
      { x: archiveDistricts.graveyard.center.x - 6.2, z: archiveDistricts.graveyard.center.z - 4.55 },
      { x: archiveDistricts.graveyard.center.x + 5.65, z: archiveDistricts.graveyard.center.z - 4.35 },
      { x: archiveDistricts.graveyard.center.x + 5.95, z: archiveDistricts.graveyard.center.z + 4.15 },
      { x: archiveDistricts.graveyard.center.x - 6.05, z: archiveDistricts.graveyard.center.z + 4.55 },
    ];
    const learningCentreShape = [
      { x: archiveDistricts.learningCentre.center.x - 5.8, z: archiveDistricts.learningCentre.center.z - 4.75 },
      { x: archiveDistricts.learningCentre.center.x + 5.95, z: archiveDistricts.learningCentre.center.z - 4.35 },
      { x: archiveDistricts.learningCentre.center.x + 6.15, z: archiveDistricts.learningCentre.center.z + 4.45 },
      { x: archiveDistricts.learningCentre.center.x - 5.55, z: archiveDistricts.learningCentre.center.z + 4.7 },
    ];
    const cityRouteWalkways = cityRoutes
      .filter((route) => route.kind !== "rail")
      .map((route) => pathPolygon(route.start, route.end, route.walkWidth ?? Math.max(1.04, route.width + PLAYER_BALL_RADIUS * 2.35)));
    const projectPlotShapes = mapItems.map((project) => {
      const isFlagship = project.tier === "flagship" || project.id === "whatsapp-wrapped" || project.id === "jashby";
      const isLandmark = project.category === "Landmark";
      if (project.mapKind === "graveyard") return plotPolygon(project, 1.24, 1.02);
      if (project.mapKind === "learning") return plotPolygon(project, 1.12, 1.04);
      return plotPolygon(project, isFlagship ? 5.15 : isLandmark ? 3.75 : 4.3, isFlagship ? 4.15 : isLandmark ? 3.15 : 3.55);
    });
    const walkableAreas = [
      mainLandShape,
      inlandSuburbsShape,
      northShoreShape,
      northArchiveHeadlandShape,
      lavenderBayShape,
      kirribilliHeadlandShape,
      northSydneyDistrictShape,
      milsonsPromenadeShape,
      bondiSandShape,
      operaPromenadeShape,
      graveyardShape,
      learningCentreShape,
      ...projectPlotShapes,
      ...cityRouteWalkways,
    ].filter((area) => area.length >= 3);

    addPlane(180, 150, 9, -5, waterMaterial, -0.07);
    addFlatShape(groundGroup, mainLandShape, parkMaterial);
    addFlatShape(groundGroup, inlandSuburbsShape, inlandMaterial, 0.018);
    addFlatShape(groundGroup, harbourWaterShape, harbourMaterial, 0.015);
    addFlatShape(groundGroup, northShoreShape, scrubMaterial, 0.026);
    addFlatShape(groundGroup, northArchiveHeadlandShape, scrubMaterial, 0.027);
    addFlatShape(groundGroup, lavenderBayShape, scrubMaterial, 0.03);
    addFlatShape(groundGroup, kirribilliHeadlandShape, scrubMaterial, 0.031);
    addFlatShape(groundGroup, northSydneyDistrictShape, districtMaterial, 0.049);
    addFlatShape(groundGroup, milsonsPromenadeShape, promenadeMaterial, 0.055);
    cityRoutes
      .filter((route) => route.kind === "bridge")
      .forEach((route) => addFlatShape(
        groundGroup,
        pathPolygon(route.start, route.end, route.walkWidth ?? 1.45),
        promenadeMaterial,
        0.058,
      ));
    addFlatShape(groundGroup, bondiSandShape, sandMaterial, 0.035);
    addFlatShape(groundGroup, operaPromenadeShape, promenadeMaterial, 0.032);
    addFlatShape(groundGroup, graveyardShape, graveyardMaterial, 0.04);
    addFlatShape(groundGroup, learningCentreShape, learningCampusMaterial, 0.042);
    projectPlotShapes.forEach((shape, index) => {
      const project = mapItems[index];
      addFlatShape(
        groundGroup,
        shape,
        project.category === "Landmark" ? landmarkPlotMaterial : project.mapKind === "graveyard" ? "#2f332f" : projectPlotMaterial,
        0.061 + index * 0.0008,
      );
    });
    addFlatShape(groundGroup, [
      { x: sydneyPlaces.cbd.x - 4.2, z: sydneyPlaces.cbd.z - 2.05 },
      { x: sydneyPlaces.cbd.x + 4.35, z: sydneyPlaces.cbd.z - 1.55 },
      { x: sydneyPlaces.cbd.x + 3.95, z: sydneyPlaces.cbd.z + 3.65 },
      { x: sydneyPlaces.cbd.x - 4.55, z: sydneyPlaces.cbd.z + 3.35 },
    ], districtMaterial, 0.045);
    addFlatShape(groundGroup, [
      { x: sydneyPlaces.blackbird.x - 3.35, z: sydneyPlaces.blackbird.z - 2.65 },
      { x: sydneyPlaces.blackbird.x + 3.95, z: sydneyPlaces.blackbird.z - 2.25 },
      { x: sydneyPlaces.blackbird.x + 3.85, z: sydneyPlaces.blackbird.z + 2.85 },
      { x: sydneyPlaces.blackbird.x - 3.25, z: sydneyPlaces.blackbird.z + 2.8 },
    ], lightDistrictMaterial, 0.052);
    addFlatShape(groundGroup, [
      { x: sydneyPlaces.eveleigh.x - 3.65, z: sydneyPlaces.eveleigh.z - 2.65 },
      { x: sydneyPlaces.eveleigh.x + 3.15, z: sydneyPlaces.eveleigh.z - 2.05 },
      { x: sydneyPlaces.eveleigh.x + 3.35, z: sydneyPlaces.eveleigh.z + 2.85 },
      { x: sydneyPlaces.eveleigh.x - 3.55, z: sydneyPlaces.eveleigh.z + 3.05 },
    ], districtMaterial, 0.054);
    addFlatShape(groundGroup, [
      { x: sydneyPlaces.bondiJunction.x - 3.95, z: sydneyPlaces.bondiJunction.z - 3.05 },
      { x: sydneyPlaces.bondiJunction.x + 4.35, z: sydneyPlaces.bondiJunction.z - 2.85 },
      { x: sydneyPlaces.bondiJunction.x + 4.55, z: sydneyPlaces.bondiJunction.z + 3.05 },
      { x: sydneyPlaces.bondiJunction.x - 4.15, z: sydneyPlaces.bondiJunction.z + 3.35 },
    ], lightDistrictMaterial, 0.05);
    addFlatDisc(groundGroup, 2.55, scrubMaterial, sydneyPlaces.queensPark, 0.043, [1.35, 0.92], 48);
    addFlatDisc(groundGroup, 2.15, scrubMaterial, sydneyPlaces.doverHeights, 0.041, [1.2, 1.55], 48);
    addFlatDisc(groundGroup, 2.42, pitchMaterial, nudgePoint(sydneyPlaces.sportsField, 0.45, 0.3), 0.065, [1.55, 0.92], 48);

    addSydneyLandmarks(scene, addTexture);
    addLandscapeDetails(scene);
    addArchiveDistricts(scene, addTexture);
    addCityPaths(scene);

    const colliders: THREE.Object3D[] = [];
    const projectGroups = new Map<string, THREE.Group>();
    const rings = new Map<string, THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>>();
    const projectStops = new Map<string, { position: THREE.Vector3; radius: number }>();
    const loader = new THREE.TextureLoader();

    mapItems.forEach((project) => {
      const group = new THREE.Group();
      group.position.set(project.x, 0, project.z);
      group.userData.projectId = project.id;
      const isArchiveZoneItem = project.mapKind === "graveyard" || project.mapKind === "learning";

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

      const imageTexture = addTexture(loader.load(projectImageSrc(project), (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }));

      const imageDecal = new THREE.Mesh(
        new THREE.PlaneGeometry(
          isArchiveZoneItem ? 0.82 : project.tier === "flagship" ? 2.45 : 2.05,
          isArchiveZoneItem ? 0.48 : project.tier === "flagship" ? 1.45 : 1.2,
        ),
        new THREE.MeshBasicMaterial({ map: imageTexture, side: THREE.DoubleSide }),
      );
      imageDecal.rotation.x = -Math.PI / 2;
      imageDecal.position.set(0, 0.105, isArchiveZoneItem ? -0.62 : project.tier === "flagship" ? -1.95 : -1.65);
      imageDecal.userData.projectId = project.id;
      group.add(imageDecal);
      colliders.push(imageDecal);

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(isArchiveZoneItem ? 1.18 : 2.4, isArchiveZoneItem ? 0.42 : 0.8),
        new THREE.MeshBasicMaterial({ map: addTexture(labelTexture(project)), side: THREE.DoubleSide }),
      );
      label.rotation.x = -Math.PI / 2;
      label.position.set(0, 0.11, isArchiveZoneItem ? 0.62 : 1.38);
      label.userData.projectId = project.id;
      group.add(label);
      colliders.push(label);

      const stopRadius = isArchiveZoneItem ? 0.72 : project.tier === "flagship" ? 1.35 : 1.25;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(stopRadius, 0.022, 8, 72),
        new THREE.MeshBasicMaterial({ color: "#d8dacb", transparent: true, opacity: 0.035 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.065;
      group.add(ring);
      rings.set(project.id, ring);
      projectStops.set(project.id, {
        position: new THREE.Vector3(project.x, 0, project.z),
        radius: stopRadius,
      });

      scene.add(group);
      projectGroups.set(project.id, group);
    });

    const player = createSoccerBall();
    scene.add(player);
    const target = new THREE.Vector3(0, PLAYER_BALL_RADIUS, 0);
    const activeIdRef = { current: initialActiveIdRef.current };
    const nearbyIdRef = { current: null as string | null };
    let playerControlled = false;
    const queuedTargets: THREE.Vector3[] = [];

    const setAutoRoute = (route: MapPoint[]) => {
      queuedTargets.length = 0;
      const [first, ...rest] = route;
      rest.forEach((point) => queuedTargets.push(new THREE.Vector3(point.x, PLAYER_BALL_RADIUS, point.z)));
      if (first) target.set(first.x, PLAYER_BALL_RADIUS, first.z);
    };

    const focusProject = (id: string) => {
      activeIdRef.current = id;
      rings.forEach((ring, projectId) => {
        ring.material.opacity = projectId === id ? 0.32 : 0.035;
        ring.material.color.set(projectId === id ? "#fff8dc" : "#d8dacb");
      });
      const group = projectGroups.get(id);
      const project = mapItems.find((item) => item.id === id);
      if (group && project && !playerControlled) {
        const destination = project.mapKind || project.category === "Landmark"
          ? { x: group.position.x, z: group.position.z }
          : { x: group.position.x, z: group.position.z + 2.2 };
        const route = findWalkableRoute(
          { x: player.position.x, z: player.position.z },
          destination,
          walkableAreas,
          PLAYER_BALL_RADIUS,
        );
        if (route) {
          setAutoRoute(route);
        } else {
          target.set(destination.x, PLAYER_BALL_RADIUS, destination.z);
        }
      }
    };

    focusProject(initialActiveIdRef.current);
    const startPosition = new THREE.Vector3(sydneyPlaces.cbd.x + 9.1, PLAYER_BALL_RADIUS, sydneyPlaces.cbd.z + 4.1);
    target.copy(startPosition);
    player.position.copy(startPosition);

    const keys = new Set<string>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const clickedPoint = new THREE.Vector3();
    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = camera.aspect < 0.75 ? 46 : 36;
      camera.updateProjectionMatrix();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS.includes(key) && !isEditableTarget(event.target)) {
        event.preventDefault();
        keys.add(key);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS.includes(key)) {
        event.preventDefault();
        keys.delete(key);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(colliders, true)[0];
      const id = hit?.object.userData.projectId as string | undefined;
      if (id) {
        onInspectProjectRef.current?.(id);
        return;
      }
      if (raycaster.ray.intersectPlane(groundPlane, clickedPoint)) {
        const nextTarget = {
          x: THREE.MathUtils.clamp(clickedPoint.x, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX),
          z: THREE.MathUtils.clamp(clickedPoint.z, PLAYER_BOUNDS.minZ, PLAYER_BOUNDS.maxZ),
        };
        const route = findWalkableRoute(
          { x: player.position.x, z: player.position.z },
          nextTarget,
          walkableAreas,
          PLAYER_BALL_RADIUS,
        );
        if (route) {
          playerControlled = true;
          setAutoRoute(route);
        }
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("fullscreenchange", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let animationFrame = 0;
    let last = performance.now();

    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      camera.getWorldDirection(cameraForward);
      cameraForward.y = 0;
      if (cameraForward.lengthSq() < 0.001) cameraForward.set(0, 0, -1);
      cameraForward.normalize();
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
      cameraRight.y = 0;
      if (cameraRight.lengthSq() < 0.001) cameraRight.set(1, 0, 0);
      cameraRight.normalize();

      const direction = new THREE.Vector3();
      if (keys.has("w") || keys.has("arrowup")) direction.add(cameraForward);
      if (keys.has("s") || keys.has("arrowdown")) direction.sub(cameraForward);
      if (keys.has("a") || keys.has("arrowleft")) direction.sub(cameraRight);
      if (keys.has("d") || keys.has("arrowright")) direction.add(cameraRight);

      if (direction.lengthSq() > 0) {
        direction.normalize().multiplyScalar(delta * PLAYER_SPEED);
        playerControlled = true;
        queuedTargets.length = 0;
        const previousPosition = player.position.clone();
        const nextX = THREE.MathUtils.clamp(previousPosition.x + direction.x, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX);
        const nextZ = THREE.MathUtils.clamp(previousPosition.z + direction.z, PLAYER_BOUNDS.minZ, PLAYER_BOUNDS.maxZ);
        const previousMapPoint = { x: previousPosition.x, z: previousPosition.z };
        const nextMapPoint = { x: nextX, z: nextZ };
        const nextXMapPoint = { x: nextX, z: previousPosition.z };
        const nextZMapPoint = { x: previousPosition.x, z: nextZ };
        if (segmentInWalkableAreas(previousMapPoint, nextMapPoint, walkableAreas, PLAYER_BALL_RADIUS)) {
          player.position.set(nextX, PLAYER_BALL_RADIUS, nextZ);
        } else if (segmentInWalkableAreas(previousMapPoint, nextXMapPoint, walkableAreas, PLAYER_BALL_RADIUS)) {
          player.position.set(nextX, PLAYER_BALL_RADIUS, previousPosition.z);
        } else if (segmentInWalkableAreas(previousMapPoint, nextZMapPoint, walkableAreas, PLAYER_BALL_RADIUS)) {
          player.position.set(previousPosition.x, PLAYER_BALL_RADIUS, nextZ);
        } else {
          player.position.copy(previousPosition);
        }
        player.position.y = PLAYER_BALL_RADIUS;
        target.copy(player.position);
        const moved = player.position.clone().sub(previousPosition);
        const travel = Math.hypot(moved.x, moved.z);
        if (travel > 0.0001) {
          const rollAxis = new THREE.Vector3(moved.z, 0, -moved.x).normalize();
          player.rotateOnWorldAxis(rollAxis, travel / PLAYER_BALL_RADIUS);
        }
      } else {
        const previousPosition = player.position.clone();
        if (Math.hypot(player.position.x - target.x, player.position.z - target.z) < 0.18 && queuedTargets.length > 0) {
          target.copy(queuedTargets.shift()!);
        }

        const toTarget = target.clone().sub(player.position);
        toTarget.y = 0;
        const remaining = Math.hypot(toTarget.x, toTarget.z);
        if (remaining > 0.001) toTarget.multiplyScalar(1 / remaining);
        const travelDistance = Math.min(remaining, delta * PLAYER_SPEED * 0.9);
        const nextPosition = player.position.clone();
        nextPosition.x += toTarget.x * travelDistance;
        nextPosition.z += toTarget.z * travelDistance;
        if (segmentInWalkableAreas(
          { x: previousPosition.x, z: previousPosition.z },
          { x: nextPosition.x, z: nextPosition.z },
          walkableAreas,
          PLAYER_BALL_RADIUS,
        )) {
          player.position.copy(nextPosition);
        } else {
          queuedTargets.length = 0;
          target.copy(previousPosition);
          player.position.copy(previousPosition);
        }
        player.position.y = PLAYER_BALL_RADIUS;
        const moved = player.position.clone().sub(previousPosition);
        const travel = Math.hypot(moved.x, moved.z);
        if (travel > 0.0001) {
          const rollAxis = new THREE.Vector3(moved.z, 0, -moved.x).normalize();
          player.rotateOnWorldAxis(rollAxis, travel / PLAYER_BALL_RADIUS);
        }
      }

      if (playerControlled) {
        let nearestId: string | null = null;
        let nearestDistance = Number.POSITIVE_INFINITY;
        projectStops.forEach((stop, id) => {
          const distance = Math.hypot(player.position.x - stop.position.x, player.position.z - stop.position.z);
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

      const isNarrowView = camera.aspect < 0.75;
      const cameraTarget = new THREE.Vector3(
        player.position.x + (isNarrowView ? 12.6 : 8.1),
        isNarrowView ? 21.4 : 16.4,
        player.position.z + (isNarrowView ? 18.6 : 13.7),
      );
      camera.position.lerp(cameraTarget, 0.095);
      camera.lookAt(
        player.position.x + (isNarrowView ? 1.65 : 0.9),
        1.05,
        player.position.z + (isNarrowView ? -0.55 : -1.05),
      );

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
          bounds: PLAYER_BOUNDS,
          camera: {
            fov: Number(camera.fov.toFixed(2)),
            x: Number(camera.position.x.toFixed(2)),
            y: Number(camera.position.y.toFixed(2)),
            z: Number(camera.position.z.toFixed(2)),
          },
          objects: scene.children.length,
          pixelReady: Boolean(context && canvas.width > 0 && canvas.height > 0),
        };
      },
    };

    window.__portfolioCityStatus = () => {
      const rect = canvas.getBoundingClientRect();
      const toScreenPoint = (point: MapPoint) => {
        const projected = new THREE.Vector3(point.x, 0.12, point.z).project(camera);
        return {
          x: Number((((projected.x + 1) / 2) * rect.width).toFixed(1)),
          y: Number((((1 - projected.y) / 2) * rect.height).toFixed(1)),
          visible: projected.z >= -1 && projected.z <= 1,
        };
      };
      const toWaterSample = (point: MapPoint) => ({
        ...toScreenPoint(point),
        radiusWalkable: pointInWalkableAreasWithRadius(point.x, point.z, walkableAreas, PLAYER_BALL_RADIUS),
      });
      const currentPoint = { x: player.position.x, z: player.position.z };
      return {
        active: activeIdRef.current,
        canvas: { width: canvas.width, height: canvas.height },
        bounds: PLAYER_BOUNDS,
        camera: {
          fov: Number(camera.fov.toFixed(2)),
          x: Number(camera.position.x.toFixed(2)),
          y: Number(camera.position.y.toFixed(2)),
          z: Number(camera.position.z.toFixed(2)),
        },
        nearby: nearbyIdRef.current,
        objects: scene.children.length,
        player: {
          x: Number(player.position.x.toFixed(2)),
          y: Number(player.position.y.toFixed(2)),
          z: Number(player.position.z.toFixed(2)),
          radius: PLAYER_BALL_RADIUS,
        },
        target: {
          x: Number(target.x.toFixed(2)),
          y: Number(target.y.toFixed(2)),
          z: Number(target.z.toFixed(2)),
        },
        routeQueue: queuedTargets.length,
        walkable: pointInWalkableAreas(player.position.x, player.position.z, walkableAreas),
        radiusWalkable: pointInWalkableAreasWithRadius(player.position.x, player.position.z, walkableAreas, PLAYER_BALL_RADIUS),
        safeLandmarks: {
          harbourBridge: pointInWalkableAreasWithRadius(sydneyPlaces.harbourBridge.x, sydneyPlaces.harbourBridge.z, walkableAreas, PLAYER_BALL_RADIUS),
          milsonsPoint: pointInWalkableAreasWithRadius(sydneyPlaces.milsonsPoint.x, sydneyPlaces.milsonsPoint.z, walkableAreas, PLAYER_BALL_RADIUS),
          northSydney: pointInWalkableAreasWithRadius(sydneyPlaces.northSydney.x, sydneyPlaces.northSydney.z, walkableAreas, PLAYER_BALL_RADIUS),
        },
        northSydneyReachable: Boolean(findWalkableRoute(
          currentPoint,
          sydneyPlaces.northSydney,
          walkableAreas,
          PLAYER_BALL_RADIUS,
        )),
        bridgeCrossingReady:
          segmentInWalkableAreas(sydneyPlaces.operaHouse, sydneyPlaces.harbourBridge, walkableAreas, PLAYER_BALL_RADIUS) &&
          segmentInWalkableAreas(sydneyPlaces.harbourBridge, sydneyPlaces.milsonsPoint, walkableAreas, PLAYER_BALL_RADIUS),
        reachableProjectCount: mapItems.filter((project) => Boolean(findWalkableRoute(
          currentPoint,
          project,
          walkableAreas,
          PLAYER_BALL_RADIUS,
        ))).length,
        screenLandmarks: {
          harbourBridge: toScreenPoint(sydneyPlaces.harbourBridge),
          milsonsPoint: toScreenPoint(sydneyPlaces.milsonsPoint),
          northSydney: toScreenPoint(sydneyPlaces.northSydney),
          operaHouse: toScreenPoint(sydneyPlaces.operaHouse),
          blackbird: toScreenPoint(cityProjectPlots.whatsappWrapped),
          jashby: toScreenPoint(cityProjectPlots.jashby),
          quantium: toScreenPoint(cityProjectPlots.quantium),
          graveyard: toScreenPoint(archiveDistricts.graveyard.center),
          learningCentre: toScreenPoint(archiveDistricts.learningCentre.center),
        },
        screenWaterSamples: {
          westHarbour: toWaterSample({ x: -13.2, z: -13.6 }),
          centreHarbour: toWaterSample({ x: -6.5, z: -10.3 }),
          eastHarbour: toWaterSample({ x: 8.4, z: -10.6 }),
        },
      };
    };
    canvas.dataset.cityReady = "true";
    canvas.dataset.cityObjects = String(scene.children.length);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("fullscreenchange", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      resizeObserver.disconnect();
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

  if (webglUnavailable) {
    return (
      <div className="city-canvas city-canvas-fallback" role="img" aria-label="3D portfolio city unavailable">
        <strong>3D city paused</strong>
        <span>WebGL is disabled in this browser.</span>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="city-canvas" data-scene-ready="true" aria-label="3D portfolio city" />;
}

function addCityPaths(scene: THREE.Scene) {
  const roadMaterial = new THREE.MeshStandardMaterial({ color: "#e7d093", roughness: 0.86 });
  const bridgeMaterial = new THREE.MeshStandardMaterial({ color: "#d8c494", roughness: 0.76 });
  const railMaterial = new THREE.MeshStandardMaterial({ color: "#29343a", roughness: 0.62, metalness: 0.06 });

  cityRoutes.forEach((route) => {
    const material = route.kind === "rail" ? railMaterial : route.kind === "bridge" ? bridgeMaterial : roadMaterial;
    addPathSegment(scene, route.start, route.end, route.width, material);
    if (route.kind === "bridge") {
      addBridgeCrossingLane(scene, route.start, route.end);
    }
  });

  [
    sydneyPlaces.northSydney,
    sydneyPlaces.milsonsPoint,
    sydneyPlaces.kirribilli,
    sydneyPlaces.harbourBridge,
    sydneyPlaces.operaHouse,
    sydneyPlaces.cbd,
    sydneyPlaces.centralStation,
    sydneyPlaces.blackbird,
    sydneyPlaces.eveleigh,
    sydneyPlaces.bondiJunction,
    sydneyPlaces.queensPark,
    sydneyPlaces.sportsField,
    sydneyPlaces.doverHeights,
    archiveDistricts.graveyard.entry,
    archiveDistricts.learningCentre.entry,
  ].forEach((point) => {
    const node = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 28), roadMaterial);
    node.position.set(point.x, 0.095, point.z);
    node.receiveShadow = true;
    scene.add(node);
  });
}

function addPathSegment(
  scene: THREE.Scene,
  start: MapPoint,
  end: MapPoint,
  width: number,
  material: THREE.Material,
) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.05) return;

  const path = new THREE.Mesh(new THREE.BoxGeometry(length, 0.035, width), material);
  path.position.set(start.x + dx / 2, 0.075, start.z + dz / 2);
  path.rotation.y = -Math.atan2(dz, dx);
  path.receiveShadow = true;
  scene.add(path);
}

function addArchiveDistricts(
  scene: THREE.Scene,
  addTexture: (texture?: THREE.Texture) => THREE.Texture | undefined,
) {
  const group = new THREE.Group();
  scene.add(group);

  const graveyard = archiveDistricts.graveyard.center;
  const learning = archiveDistricts.learningCentre.center;
  const fenceMaterial = modelMaterial("#1d211d", { roughness: 0.82 });
  const stoneMaterial = modelMaterial("#6d736c", { roughness: 0.9 });
  const brassMaterial = modelMaterial("#d8b85f", { roughness: 0.55, metalness: 0.08 });
  const campusWall = modelMaterial("#dfe9df", { roughness: 0.72 });
  const glass = modelMaterial("#77cdd1", { roughness: 0.28, metalness: 0.05 });
  const screen = new THREE.MeshBasicMaterial({ color: "#163135" });
  const graveyardFenceWidth = 11.15;
  const graveyardFenceDepth = 8.05;
  const graveyardHalfWidth = graveyardFenceWidth / 2;
  const graveyardHalfDepth = graveyardFenceDepth / 2;

  addBox(group, [graveyardFenceWidth, 0.12, 0.14], fenceMaterial, [graveyard.x, 0.18, graveyard.z - graveyardHalfDepth]);
  addBox(group, [graveyardFenceWidth, 0.12, 0.14], fenceMaterial, [graveyard.x, 0.18, graveyard.z + graveyardHalfDepth]);
  addBox(group, [0.14, 0.12, graveyardFenceDepth], fenceMaterial, [graveyard.x - graveyardHalfWidth, 0.18, graveyard.z]);
  addBox(group, [0.14, 0.12, graveyardFenceDepth], fenceMaterial, [graveyard.x + graveyardHalfWidth, 0.18, graveyard.z]);
  for (let i = 0; i < 16; i += 1) {
    const x = graveyard.x - 5.18 + i * 0.69;
    addBox(group, [0.08, 0.5, 0.08], fenceMaterial, [x, 0.36, graveyard.z - graveyardHalfDepth - 0.02]);
    addBox(group, [0.08, 0.5, 0.08], fenceMaterial, [x, 0.36, graveyard.z + graveyardHalfDepth + 0.02]);
  }
  [-0.45, 0.45].forEach((x) => {
    addBox(group, [0.12, 1.2, 0.12], brassMaterial, [graveyard.x + x, 0.68, graveyard.z - graveyardHalfDepth - 0.18]);
  });
  addCylinderBetween(
    group,
    new THREE.Vector3(graveyard.x - 0.45, 1.3, graveyard.z - graveyardHalfDepth - 0.18),
    new THREE.Vector3(graveyard.x + 0.45, 1.3, graveyard.z - graveyardHalfDepth - 0.18),
    0.04,
    brassMaterial,
  );
  addBox(group, [1.55, 0.32, 0.18], stoneMaterial, [graveyard.x + 4.25, 0.34, graveyard.z + 3.1], [0, -0.18, 0]);
  addBox(group, [0.92, 0.08, 0.64], "#20251f", [graveyard.x + 3.98, 0.12, graveyard.z + 2.55], [0, 0.44, 0]);

  addBox(group, [5.35, 0.18, 2.05], "#d7c49b", [learning.x, 0.18, learning.z - 2.55], [0, 0.04, 0], { roughness: 0.72 });
  addBox(group, [4.8, 1.1, 1.42], campusWall, [learning.x, 0.82, learning.z - 2.55], [0, 0.04, 0]);
  addBox(group, [5.1, 0.18, 1.68], "#f7d35f", [learning.x, 1.45, learning.z - 2.55], [0, 0.04, 0], { roughness: 0.48 });
  [-1.6, -0.8, 0, 0.8, 1.6].forEach((x) => {
    addBox(group, [0.42, 0.48, 0.07], glass, [learning.x + x, 0.9, learning.z - 3.28], [0, 0.04, 0]);
  });
  addBox(group, [2.7, 0.08, 0.92], "#243033", [learning.x, 0.28, learning.z + 2.35], [0, -0.08, 0], { roughness: 0.54 });
  for (let index = 0; index < 4; index += 1) {
    const x = learning.x - 1.05 + index * 0.7;
    addBox(group, [0.44, 0.34, 0.04], screen, [x, 0.56, learning.z + 1.92], [0.12, -0.08, 0]);
    addBox(group, [0.32, 0.04, 0.045], index % 2 ? "#22d66f" : "#4cbad8", [x, 0.58, learning.z + 1.89], [0.12, -0.08, 0]);
  }

  addLandmarkSign(scene, addTexture, "Project Graveyard", "north shore old builds", graveyard.x - 1.25, graveyard.z - 4.85, "#7d8178");
  addLandmarkSign(scene, addTexture, "Learning Centre", "tutorials and practice", learning.x - 1.25, learning.z - 5.15, "#77cdd1");

  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

function addBridgeCrossingLane(scene: THREE.Scene, start: MapPoint, end: MapPoint) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.05) return;

  const lane = new THREE.Group();
  lane.position.set(start.x + dx / 2, 0, start.z + dz / 2);
  lane.rotation.y = -Math.atan2(dz, dx);
  scene.add(lane);

  const deck = modelMaterial("#f1d99b", { roughness: 0.74 });
  const rail = modelMaterial("#2d3a40", { roughness: 0.46, metalness: 0.12 });
  const paint = new THREE.MeshBasicMaterial({ color: "#fff8dc" });

  addBox(lane, [length, 0.06, 1.22], deck, [0, 0.16, 0], [0, 0, 0]);
  [-0.68, 0.68].forEach((z) => {
    addBox(lane, [length, 0.08, 0.05], rail, [0, 0.25, z], [0, 0, 0]);
    for (let i = 0; i < Math.floor(length / 0.58); i += 1) {
      const x = -length / 2 + 0.35 + i * 0.58;
      addCylinder(lane, 0.025, 0.025, 0.3, rail, [x, 0.38, z], [0, 0, 0], 8);
    }
  });
  for (let i = 0; i < Math.floor(length / 0.86); i += 1) {
    const x = -length / 2 + 0.42 + i * 0.86;
    addBox(lane, [0.34, 0.025, 0.05], paint, [x, 0.205, 0], [0, 0, 0]);
  }
}

function addLandscapeDetails(scene: THREE.Scene) {
  const details = new THREE.Group();
  scene.add(details);

  const foamMaterial = new THREE.MeshBasicMaterial({ color: "#f8fbf0", transparent: true, opacity: 0.84 });
  const wakeMaterial = new THREE.MeshBasicMaterial({ color: "#e9fbff", transparent: true, opacity: 0.54 });
  const wetSandMaterial = modelMaterial("#cfae63", { roughness: 0.92 });
  const rockMaterial = modelMaterial("#a58f66", { roughness: 0.92 });
  const courtMaterial = modelMaterial("#1f6f51", { roughness: 0.84 });
  const poolMaterial = modelMaterial("#2fa8c9", { roughness: 0.18, metalness: 0.04 });
  const treeTrunk = modelMaterial("#72563a", { roughness: 0.78 });
  const treeGreen = modelMaterial("#246b3e", { roughness: 0.88 });
  const palmGreen = modelMaterial("#2f8d55", { roughness: 0.82 });
  const suburbWall = modelMaterial("#efe1bf", { roughness: 0.76 });
  const darkRoad = modelMaterial("#2b2f2b", { roughness: 0.78 });
  const parkPaint = modelMaterial("#315f40", { roughness: 0.88 });

  const addTree = (point: MapPoint, scale = 1) => {
    addCylinder(details, 0.045 * scale, 0.06 * scale, 0.42 * scale, treeTrunk, [point.x, 0.27 * scale, point.z], [0, 0, 0], 10);
    addCone(details, 0.28 * scale, 0.62 * scale, 7, treeGreen, [point.x, 0.78 * scale, point.z]);
  };

  const addPalm = (point: MapPoint, rotation = 0, scale = 1) => {
    addCylinder(details, 0.04 * scale, 0.065 * scale, 0.78 * scale, treeTrunk, [point.x, 0.42 * scale, point.z], [0.18, 0, -0.08], 10);
    for (let i = 0; i < 5; i += 1) {
      addBox(details, [0.08 * scale, 0.035 * scale, 0.74 * scale], palmGreen, [point.x, 0.86 * scale, point.z], [0.12, rotation + i * 1.25, 0.42]);
    }
  };

  const addInlandHouse = (point: MapPoint, rotation: number, roofColor: string, scale = 1) => {
    const house = new THREE.Group();
    house.position.set(point.x, 0, point.z);
    house.rotation.y = rotation;
    addBox(house, [0.72 * scale, 0.32 * scale, 0.55 * scale], suburbWall, [0, 0.22 * scale, 0]);
    addBox(house, [0.84 * scale, 0.12 * scale, 0.64 * scale], roofColor, [0, 0.48 * scale, 0], [0, 0, 0], { roughness: 0.62 });
    addBox(house, [0.18 * scale, 0.16 * scale, 0.04 * scale], "#94d8e8", [-0.22 * scale, 0.25 * scale, -0.3 * scale]);
    addBox(house, [0.18 * scale, 0.16 * scale, 0.04 * scale], "#94d8e8", [0.22 * scale, 0.25 * scale, -0.3 * scale]);
    addBox(house, [0.16 * scale, 0.2 * scale, 0.04 * scale], "#1c2322", [0, 0.2 * scale, 0.29 * scale]);
    details.add(house);
  };

  [
    { x: sydneyPlaces.cbd.x - 3.15, z: sydneyPlaces.cbd.z + 2.65 },
    { x: sydneyPlaces.cbd.x + 3.1, z: sydneyPlaces.cbd.z + 2.35 },
    { x: sydneyPlaces.blackbird.x - 2.35, z: sydneyPlaces.blackbird.z + 2.15 },
    { x: sydneyPlaces.eveleigh.x + 2.45, z: sydneyPlaces.eveleigh.z + 2.05 },
    { x: sydneyPlaces.northSydney.x - 2.95, z: sydneyPlaces.northSydney.z + 0.55 },
    { x: sydneyPlaces.northSydney.x + 2.55, z: sydneyPlaces.northSydney.z + 0.35 },
    { x: sydneyPlaces.northSydney.x - 6.85, z: sydneyPlaces.northSydney.z - 1.1 },
    { x: sydneyPlaces.northSydney.x - 4.35, z: sydneyPlaces.northSydney.z - 3.7 },
    { x: sydneyPlaces.northSydney.x + 0.85, z: sydneyPlaces.northSydney.z - 4.35 },
    { x: sydneyPlaces.northSydney.x + 5.1, z: sydneyPlaces.northSydney.z - 2.65 },
    { x: archiveDistricts.graveyard.center.x - 5.75, z: archiveDistricts.graveyard.center.z - 2.85 },
    { x: archiveDistricts.graveyard.center.x - 5.15, z: archiveDistricts.graveyard.center.z + 3.35 },
    { x: archiveDistricts.graveyard.center.x + 4.9, z: archiveDistricts.graveyard.center.z + 3.55 },
    { x: archiveDistricts.graveyard.entry.x + 1.35, z: archiveDistricts.graveyard.entry.z + 1.65 },
    { x: sydneyPlaces.milsonsPoint.x - 2.4, z: sydneyPlaces.milsonsPoint.z + 0.92 },
    { x: sydneyPlaces.kirribilli.x + 2.35, z: sydneyPlaces.kirribilli.z + 1.1 },
    { x: sydneyPlaces.queensPark.x - 2.6, z: sydneyPlaces.queensPark.z - 0.7 },
    { x: sydneyPlaces.queensPark.x + 2.15, z: sydneyPlaces.queensPark.z + 0.85 },
    { x: sydneyPlaces.sportsField.x - 1.55, z: sydneyPlaces.sportsField.z + 2.4 },
  ].forEach((point, index) => addTree(point, 0.82 + (index % 3) * 0.08));

  [
    { x: -20.6, z: 5.35 },
    { x: -18.8, z: 11.2 },
    { x: -12.15, z: 12.9 },
    { x: -5.5, z: 12.7 },
    { x: 2.1, z: 13.4 },
    { x: 9.45, z: 13.65 },
    { x: 16.7, z: 15.1 },
    { x: 24.4, z: 13.2 },
    { x: 28.65, z: 16.25 },
    { x: 29.2, z: 21.5 },
    { x: 20.55, z: 21.9 },
    { x: 25.6, z: 7.35 },
  ].forEach((point, index) => addTree(point, 0.74 + (index % 3) * 0.1));

  ([
    [-19.55, 4.6, -0.16, "#c84f3b"],
    [-18.5, 6.0, 0.2, "#4cbad8"],
    [-10.3, 12.05, -0.34, "#f0c36a"],
    [-8.95, 13.0, 0.12, "#c84f3b"],
    [4.7, 12.25, -0.08, "#4cbad8"],
    [6.0, 13.15, 0.18, "#f0c36a"],
    [18.0, 16.1, -0.18, "#c84f3b"],
    [22.65, 16.85, 0.26, "#4cbad8"],
    [27.85, 14.65, -0.2, "#f0c36a"],
    [29.4, 20.35, 0.16, "#c84f3b"],
  ] as const).forEach(([x, z, rotation, roofColor], index) => {
    addInlandHouse({ x, z }, rotation, roofColor, 0.86 + (index % 2) * 0.1);
  });

  addBox(details, [5.9, 0.045, 0.24], darkRoad, [archiveDistricts.graveyard.center.x - 3.45, 0.11, archiveDistricts.graveyard.center.z + 3.35], [0, 0.18, 0]);
  addBox(details, [7.4, 0.045, 0.22], darkRoad, [23.4, 0.11, 15.95], [0, -0.4, 0]);
  addBox(details, [3.5, 0.04, 1.16], parkPaint, [2.2, 0.105, 15.0], [0, -0.08, 0]);
  addBox(details, [0.08, 0.045, 1.08], "#fffdf4", [2.2, 0.13, 15.0], [0, -0.08, 0]);
  addBox(details, [3.4, 0.04, 0.08], "#fffdf4", [2.2, 0.13, 15.0], [0, -0.08, 0]);

  for (let i = 0; i < 8; i += 1) {
    addPalm(
      {
        x: sydneyPlaces.bondiBeach.x - 1.72 + i * 0.45,
        z: sydneyPlaces.bondiBeach.z + 2.22 + Math.sin(i * 0.9) * 0.18,
      },
      i * 0.35,
      0.92,
    );
  }

  for (let i = 0; i < 7; i += 1) {
    addBox(
      details,
      [0.055, 0.035, 1.65 + i * 0.14],
      foamMaterial,
      [sydneyPlaces.bondiBeach.x + 2.28 + i * 0.18, 0.14, sydneyPlaces.bondiBeach.z - 1.24 + i * 0.57],
      [0, -0.16, 0],
    );
    addBox(
      details,
      [0.055, 0.028, 1.4 + i * 0.1],
      wetSandMaterial,
      [sydneyPlaces.bondiBeach.x + 1.76 + i * 0.1, 0.085, sydneyPlaces.bondiBeach.z - 0.94 + i * 0.58],
      [0, -0.12, 0],
    );
  }

  for (let i = 0; i < 12; i += 1) {
    addBox(
      details,
      [0.55 + (i % 3) * 0.16, 0.32 + (i % 4) * 0.11, 0.72],
      rockMaterial,
      [sydneyPlaces.doverHeights.x - 2.52 + i * 0.42, 0.2 + (i % 4) * 0.045, sydneyPlaces.doverHeights.z + 0.18 + i * 0.34],
      [0, -0.25 + i * 0.04, 0.04],
    );
  }

  [
    { x: sydneyPlaces.doverHeights.x - 1.28, z: sydneyPlaces.doverHeights.z + 1.25 },
    { x: sydneyPlaces.doverHeights.x + 0.36, z: sydneyPlaces.doverHeights.z + 0.82 },
  ].forEach((point, index) => {
    addBox(details, [1.08, 0.045, 0.52], poolMaterial, [point.x, 0.18, point.z], [0, 0.22 - index * 0.28, 0]);
    addBox(details, [1.22, 0.035, 0.66], "#fffdf4", [point.x, 0.14, point.z], [0, 0.22 - index * 0.28, 0]);
  });

  addBox(details, [2.48, 0.035, 1.42], courtMaterial, [sydneyPlaces.queensPark.x - 0.25, 0.12, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);
  addBox(details, [2.48, 0.04, 0.045], "#fffdf4", [sydneyPlaces.queensPark.x - 0.25, 0.16, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);
  addBox(details, [0.045, 0.04, 1.42], "#fffdf4", [sydneyPlaces.queensPark.x - 0.25, 0.16, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);

  for (let i = 0; i < 8; i += 1) {
    addBox(
      details,
      [0.56 + (i % 2) * 0.14, 0.22 + (i % 3) * 0.07, 0.46],
      rockMaterial,
      [sydneyPlaces.milsonsPoint.x - 3.1 + i * 0.72, 0.14 + (i % 2) * 0.04, sydneyPlaces.milsonsPoint.z + 1.28 + Math.sin(i) * 0.16],
      [0, -0.16 + i * 0.05, 0.03],
    );
  }

  addBox(details, [4.4, 0.07, 0.24], "#d5c7a6", [sydneyPlaces.milsonsPoint.x - 0.15, 0.12, sydneyPlaces.milsonsPoint.z + 1.12], [0, -0.05, 0], { roughness: 0.72 });
  addBox(details, [0.34, 0.06, 1.65], "#d5c7a6", [sydneyPlaces.milsonsPoint.x + 1.62, 0.11, sydneyPlaces.milsonsPoint.z + 1.72], [0, 0.18, 0], { roughness: 0.72 });
  addBox(details, [0.34, 0.06, 1.28], "#d5c7a6", [sydneyPlaces.kirribilli.x + 1.72, 0.11, sydneyPlaces.kirribilli.z + 1.48], [0, 0.36, 0], { roughness: 0.72 });

  [
    [sydneyPlaces.milsonsPoint.x - 4.55, sydneyPlaces.milsonsPoint.z + 1.58, 2.6, -0.2],
    [sydneyPlaces.milsonsPoint.x - 1.55, sydneyPlaces.milsonsPoint.z + 2.04, 2.2, 0.12],
    [sydneyPlaces.kirribilli.x + 1.2, sydneyPlaces.kirribilli.z + 2.22, 2.5, 0.32],
    [sydneyPlaces.kirribilli.x + 3.95, sydneyPlaces.kirribilli.z + 1.38, 1.8, -0.44],
    [sydneyPlaces.harbourBridge.x - 1.2, sydneyPlaces.harbourBridge.z + 0.64, 2.15, -0.05],
  ].forEach(([x, z, length, rotation], index) => {
    addBox(details, [length, 0.08, 0.16], "#bba985", [x, 0.14, z], [0, rotation, 0], { roughness: 0.84 });
    addBox(details, [length * 0.92, 0.024, 0.08], wakeMaterial, [x, 0.19, z + 0.12 + index * 0.01], [0, rotation, 0]);
  });

  for (let i = 0; i < 13; i += 1) {
    addBox(
      details,
      [0.46 + (i % 4) * 0.12, 0.22 + (i % 3) * 0.08, 0.36 + (i % 2) * 0.1],
      rockMaterial,
      [sydneyPlaces.northSydney.x - 6.05 + i * 0.72, 0.15 + (i % 2) * 0.03, sydneyPlaces.northSydney.z + 0.72 + Math.sin(i * 0.8) * 0.24],
      [0, -0.28 + i * 0.07, 0.02],
    );
  }

  [
    { x: sydneyPlaces.harbourBridge.x + 2.65, z: sydneyPlaces.harbourBridge.z + 0.95 },
    { x: sydneyPlaces.operaHouse.x - 1.8, z: sydneyPlaces.operaHouse.z - 1.1 },
    { x: sydneyPlaces.operaHouse.x + 2.3, z: sydneyPlaces.operaHouse.z - 0.65 },
  ].forEach((point, index) => {
    addBox(details, [0.72, 0.16, 0.26], "#fff7d6", [point.x, 0.12, point.z], [0, 0.3 - index * 0.22, 0], { roughness: 0.45 });
    addBox(details, [0.42, 0.09, 0.18], index === 1 ? "#e6533f" : "#2f8ec7", [point.x - 0.04, 0.25, point.z], [0, 0.3 - index * 0.22, 0], { roughness: 0.42 });
  });

  [
    [sydneyPlaces.harbourBridge.x - 1.85, sydneyPlaces.harbourBridge.z + 1.12, -0.28],
    [sydneyPlaces.operaHouse.x + 2.35, sydneyPlaces.operaHouse.z + 0.08, 0.18],
    [sydneyPlaces.cbd.x - 2.85, sydneyPlaces.cbd.z - 4.2, -0.52],
  ].forEach(([x, z, rotation], index) => {
    const ferry = new THREE.Group();
    ferry.position.set(x, 0, z);
    ferry.rotation.y = rotation;
    addBox(ferry, [1.08, 0.16, 0.36], "#fff7d6", [0, 0.16, 0], [0, 0, 0], { roughness: 0.44 });
    addBox(ferry, [0.72, 0.18, 0.26], index === 2 ? "#f0c36a" : "#2f8ec7", [-0.08, 0.31, 0], [0, 0, 0], { roughness: 0.38 });
    addBox(ferry, [0.28, 0.06, 0.28], "#151713", [0.44, 0.31, 0]);
    addBox(ferry, [1.25, 0.028, 0.045], wakeMaterial, [-0.76, 0.09, -0.2], [0, -0.2, 0]);
    addBox(ferry, [1.25, 0.028, 0.045], wakeMaterial, [-0.76, 0.09, 0.2], [0, 0.2, 0]);
    details.add(ferry);
  });

  details.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

function addHarbourBridgeArtwork(parent: THREE.Object3D, anchor: MapPoint) {
  const bridge = new THREE.Group();
  const northLanding = sydneyPlaces.milsonsPoint;
  bridge.position.set((anchor.x + northLanding.x) / 2, 0, (anchor.z + northLanding.z) / 2);
  bridge.rotation.y = -Math.atan2(northLanding.z - anchor.z, northLanding.x - anchor.x);
  bridge.scale.set(0.82, 1, 1);
  parent.add(bridge);

  const steel = modelMaterial("#59686e", { roughness: 0.32, metalness: 0.16 });
  const darkSteel = modelMaterial("#2d3a40", { roughness: 0.42, metalness: 0.14 });
  const pylonMaterial = modelMaterial("#9b9688", { roughness: 0.72 });
  const deckMaterial = modelMaterial("#464d50", { roughness: 0.52, metalness: 0.08 });
  const laneMaterial = new THREE.MeshBasicMaterial({ color: "#f7f1d1" });
  const lampMaterial = modelMaterial("#ffe9a6", { roughness: 0.35, metalness: 0.03 });

  addBox(bridge, [8.25, 0.12, 0.92], "#d8c494", [0, 0.28, 0], [0, 0, 0], { roughness: 0.76 });
  addBox(bridge, [7.7, 0.16, 0.72], deckMaterial, [0, 0.58, 0]);
  addBox(bridge, [7.4, 0.03, 0.035], laneMaterial, [0, 0.68, -0.16]);
  addBox(bridge, [7.4, 0.03, 0.035], laneMaterial, [0, 0.68, 0.16]);
  addBox(bridge, [7.78, 0.08, 0.08], darkSteel, [0, 0.86, -0.46]);
  addBox(bridge, [7.78, 0.08, 0.08], darkSteel, [0, 0.86, 0.46]);

  [-3.96, 3.96].forEach((x) => {
    [-0.42, 0.42].forEach((z) => {
      addBox(bridge, [0.5, 1.96, 0.54], pylonMaterial, [x, 0.98, z]);
      addBox(bridge, [0.66, 0.16, 0.7], pylonMaterial, [x, 2.04, z]);
      addBox(bridge, [0.34, 0.3, 0.34], pylonMaterial, [x, 2.28, z]);
      addBox(bridge, [0.13, 0.22, 0.035], "#4f5657", [x, 1.18, z + Math.sign(z) * 0.29]);
      addBox(bridge, [0.13, 0.22, 0.035], "#4f5657", [x, 1.58, z + Math.sign(z) * 0.29]);
    });
    addBox(bridge, [0.2, 1.58, 1.28], darkSteel, [x * 0.96, 0.94, 0]);
  });

  const archPoints = [-0.34, 0.34];
  archPoints.forEach((z) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.78, 0.84, z),
      new THREE.Vector3(0, 3.18, z),
      new THREE.Vector3(3.78, 0.84, z),
    );
    const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 44, 0.06, 8, false), steel);
    arch.castShadow = true;
    bridge.add(arch);

    for (let i = 1; i < 12; i += 1) {
      const t = i / 12;
      const archPoint = curve.getPoint(t);
        [1.08 - i * 0.045, 0.03, 0.052],
        foam,
        [0.52 + i * 0.22, 0.12 + i * 0.004, -1.0 + i * 0.33],
        [0, -0.36 + i * 0.06, 0],
        addCylinderBetween(bridge, deckPoint, nextDeckPoint, 0.012, steel);
      }
    }
  });

  for (let i = 0; i < 11; i += 1) {
    const x = -3.5 + i * 0.7;
    addBox(bridge, [0.055, 0.06, 1.06], darkSteel, [x, 0.94, 0]);
    addCylinder(bridge, 0.025, 0.025, 0.42, darkSteel, [x, 0.94, -0.62], [0, 0, 0], 8);
    addCylinder(bridge, 0.055, 0.055, 0.04, lampMaterial, [x, 1.18, -0.62], [0, 0, 0], 12);
    // add a couple of beach umbrellas for visual cue
    const umbrellaColors = ["#ff5b2e", "#ffdd57", "#2f8ec7"];
    umbrellaColors.forEach((c, i) => {
      addCylinder(group, 0.02, 0.02, 0.86, "#151713", [-0.9 + i * 0.7, 0.36, 0.2 + i * -0.18], [0, 0, 0], 12);
      addCone(group, 0.36, 0.12, 20, c, [-0.9 + i * 0.7, 0.86, 0.2 + i * -0.18], [Math.PI, i * 0.4, 0]);
    });
    if (i > 0) {
      addCylinderBetween(
        bridge,
        new THREE.Vector3(x - 0.35, 1.06, -0.46),
        new THREE.Vector3(x + 0.35, 1.32, 0.46),
        0.012,
        steel,
      );
      addCylinderBetween(
        bridge,
        new THREE.Vector3(x - 0.35, 1.32, 0.46),
        new THREE.Vector3(x + 0.35, 1.06, -0.46),
        0.012,
        steel,
      );
    }
  }

  [-3.18, -1.86, -0.56, 0.76, 2.1, 3.22].forEach((x, index) => {
    addCylinderBetween(
      bridge,
      new THREE.Vector3(x, 0.78, -0.46),
      new THREE.Vector3(x + (index % 2 ? 0.5 : -0.5), 1.24, 0.46),
      0.016,
      steel,
    );
  });

  [-3.46, 3.46].forEach((x) => {
    addBox(bridge, [0.9, 0.14, 1.22], "#d8c494", [x, 0.2, 0], [0, 0, 0], { roughness: 0.76 });
  });
}

function addCentrepointTower(parent: THREE.Object3D, anchor: MapPoint) {
  const tower = new THREE.Group();
  tower.position.set(anchor.x, 0, anchor.z);
  tower.rotation.y = -0.12;

  const shaft = modelMaterial("#d9d0bc", { roughness: 0.58, metalness: 0.06 });
  const steel = modelMaterial("#48545a", { roughness: 0.48, metalness: 0.12 });
  const glass = modelMaterial("#7fcbd3", { roughness: 0.26, metalness: 0.08 });
  const gold = modelMaterial("#d8b85f", { roughness: 0.44, metalness: 0.08 });
  const glow = new THREE.MeshBasicMaterial({ color: "#fff8dc" });

  addBox(tower, [0.78, 0.11, 0.78], "#343b3c", [0, 0.08, 0], [0, 0, 0], { roughness: 0.68 });
  addCylinder(tower, 0.095, 0.14, 3.45, shaft, [0, 1.82, 0], [0, 0, 0], 18);
  addCylinder(tower, 0.32, 0.32, 0.12, steel, [0, 3.25, 0], [0, 0, 0], 32);
  addCylinder(tower, 0.54, 0.42, 0.34, glass, [0, 3.48, 0], [0, 0, 0], 36);
  addCylinder(tower, 0.48, 0.55, 0.12, gold, [0, 3.73, 0], [0, 0, 0], 36);
  const observationRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 64), glow);
  observationRing.rotation.x = Math.PI / 2;
  observationRing.position.y = 3.5;
  tower.add(observationRing);

  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const deckPoint = new THREE.Vector3(Math.cos(angle) * 0.42, 3.3, Math.sin(angle) * 0.42);
    const mastPoint = new THREE.Vector3(0, 2.58, 0);
    addCylinderBetween(tower, mastPoint, deckPoint, 0.014, steel);
  }

  addSphere(tower, 0.16, gold, [0, 3.92, 0], 24).scale.set(1.25, 0.42, 1.25);
  addCylinder(tower, 0.038, 0.055, 1.18, gold, [0, 4.48, 0], [0, 0, 0], 12);
  addCylinder(tower, 0.016, 0.024, 0.56, glow, [0, 5.32, 0], [0, 0, 0], 10);
  addSphere(tower, 0.055, glow, [0, 5.63, 0], 12);

  parent.add(tower);
}

function addSydneyLandmarks(
  scene: THREE.Scene,
  addTexture: (texture?: THREE.Texture) => THREE.Texture | undefined,
) {
  const landmarks = new THREE.Group();
  scene.add(landmarks);

  const {
    harbourBridge,
    milsonsPoint,
    northSydney,
    kirribilli,
    operaHouse,
    cbd,
    blackbird,
    eveleigh,
    bondiJunction,
    queensPark,
    sportsField,
    doverHeights,
    bondiBeach,
  } = sydneyPlaces;
  const pitchCenter = nudgePoint(sportsField, 0.45, 0.3);

  addBox(landmarks, [8.4, 0.16, 2.15], "#e8d9b6", [operaHouse.x - 0.9, 0.08, operaHouse.z + 1.25]);
  addBox(landmarks, [2.9, 0.08, 1.05], "#d5c7a6", [operaHouse.x + 0.55, 0.16, operaHouse.z + 1.95], [0, -0.2, 0]);

  addHarbourBridgeArtwork(landmarks, harbourBridge);

  const northMaterials = [
    new THREE.MeshStandardMaterial({ color: "#405e67", roughness: 0.52 }),
    new THREE.MeshStandardMaterial({ color: "#54747d", roughness: 0.5, metalness: 0.06 }),
    new THREE.MeshStandardMaterial({ color: "#d7c49b", roughness: 0.64 }),
  ];
  addBox(landmarks, [6.6, 0.18, 0.74], "#343b3c", [northSydney.x - 0.05, 0.16, northSydney.z - 0.65], [0, 0.05, 0], { roughness: 0.72 });
  addBox(landmarks, [5.9, 0.08, 0.28], "#d8c494", [northSydney.x - 0.08, 0.3, northSydney.z - 0.22], [0, 0.05, 0], { roughness: 0.7 });
  for (let i = 0; i < 16; i += 1) {
    const height = 0.72 + (i % 6) * 0.34;
    const towerGroup = new THREE.Group();
    const width = 0.4 + (i % 3) * 0.1;
    towerGroup.position.set(
      northSydney.x - 3.0 + (i % 8) * 0.82,
      0,
      northSydney.z - 1.3 + Math.floor(i / 8) * 1.08 + (i % 2) * 0.14,
    );
    towerGroup.rotation.y = i % 2 ? -0.12 : 0.1;
    addBox(towerGroup, [width, height, 0.5], northMaterials[i % northMaterials.length], [0, height / 2, 0]);
    if (i % 3 !== 1) addFacadeGrid(towerGroup, width, height, 0.5, 4, 3, "#c7f0e6", 0.38);
    landmarks.add(towerGroup);
  }
  for (let i = 0; i < 18; i += 1) {
    const suburb = new THREE.Group();
    suburb.position.set(
      northSydney.x - 6.35 + (i % 9) * 1.28,
      0,
      northSydney.z - 4.65 + Math.floor(i / 9) * 1.15 + (i % 2) * 0.18,
    );
    suburb.rotation.y = -0.18 + (i % 5) * 0.08;
    addBox(suburb, [0.62, 0.22 + (i % 3) * 0.05, 0.52], i % 2 ? "#efe1bf" : "#fff7d6", [0, 0.14, 0], [0, 0, 0], { roughness: 0.76 });
    addBox(suburb, [0.72, 0.1, 0.6], i % 3 ? "#c84f3b" : "#4cbad8", [0, 0.33 + (i % 3) * 0.025, 0], [0, 0, 0], { roughness: 0.65 });
    landmarks.add(suburb);
  }

  addBox(landmarks, [3.4, 0.08, 0.58], "#d8c494", [milsonsPoint.x - 0.25, 0.12, milsonsPoint.z + 0.6], [0, -0.08, 0], { roughness: 0.7 });
  addBox(landmarks, [2.75, 0.09, 0.34], "#29343a", [milsonsPoint.x - 0.4, 0.2, milsonsPoint.z + 0.28], [0, -0.08, 0], { roughness: 0.5, metalness: 0.08 });
  addBox(landmarks, [0.08, 0.64, 1.2], "#f7d35f", [milsonsPoint.x - 1.7, 0.44, milsonsPoint.z - 0.3], [0, -0.08, 0]);
  addBox(landmarks, [0.08, 0.64, 1.2], "#f7d35f", [milsonsPoint.x + 1.1, 0.44, milsonsPoint.z - 0.1], [0, -0.08, 0]);
  addCylinder(landmarks, 0.38, 0.38, 0.08, "#fff7df", [milsonsPoint.x - 0.28, 0.52, milsonsPoint.z - 0.18], [Math.PI / 2, 0, 0], 32);
  addCylinder(landmarks, 0.24, 0.24, 0.09, "#f7d35f", [milsonsPoint.x - 0.28, 0.54, milsonsPoint.z - 0.18], [Math.PI / 2, 0, 0], 32);
  addBox(landmarks, [1.7, 0.08, 0.12], "#fffdf4", [milsonsPoint.x - 0.25, 0.55, milsonsPoint.z - 0.18], [0, -0.08, 0]);
  addBox(landmarks, [2.6, 0.12, 0.52], "#fff2c9", [milsonsPoint.x - 2.92, 0.22, milsonsPoint.z + 1.42], [0, -0.18, 0], { roughness: 0.68 });
  addBox(landmarks, [1.85, 0.34, 0.36], "#c84f3b", [milsonsPoint.x - 2.95, 0.43, milsonsPoint.z + 1.42], [0, -0.18, 0], { roughness: 0.62 });
  addBox(landmarks, [1.1, 0.08, 0.72], "#f7d35f", [milsonsPoint.x - 2.95, 0.67, milsonsPoint.z + 1.42], [0, -0.18, 0]);

  addBox(landmarks, [1.45, 0.13, 0.56], "#fff7d6", [kirribilli.x + 0.4, 0.16, kirribilli.z + 0.74], [0, -0.34, 0]);
  addBox(landmarks, [1.08, 0.42, 0.42], "#efe1bf", [kirribilli.x + 0.08, 0.42, kirribilli.z + 0.76], [0, -0.34, 0]);
  addBox(landmarks, [1.18, 0.12, 0.52], "#4cbad8", [kirribilli.x + 0.08, 0.73, kirribilli.z + 0.76], [0, -0.34, 0]);
  addBox(landmarks, [1.22, 0.08, 0.42], "#176b82", [kirribilli.x + 1.75, 0.16, kirribilli.z + 1.12], [0, 0.22, 0], { roughness: 0.22 });

  const skylineMaterials = [
    new THREE.MeshStandardMaterial({ color: "#2f5157", roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: "#415f66", roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: "#263d44", roughness: 0.48, metalness: 0.08 }),
  ];
  for (let i = 0; i < 16; i += 1) {
    const height = 0.98 + (i % 6) * 0.38;
    const towerGroup = new THREE.Group();
    const width = 0.4 + (i % 3) * 0.1;
    towerGroup.position.set(
      cbd.x - 2.45 + (i % 8) * 0.72,
      0,
      cbd.z - 1.45 + Math.floor(i / 8) * 1.08 + (i % 3) * 0.16,
    );
    towerGroup.rotation.y = (i % 2 ? 0.1 : -0.08);
    addBox(towerGroup, [width, height, 0.48], skylineMaterials[i % skylineMaterials.length], [0, height / 2, 0]);
    if (i % 2 === 0) addFacadeGrid(towerGroup, width, height, 0.48, 4, 3, "#bde5dc", 0.44);
    landmarks.add(towerGroup);
  }
  addCentrepointTower(landmarks, nudgePoint(cbd, 2.35, -0.34));

  [-1.25, 0.05, 1.38].forEach((x, index) => {
    addBox(landmarks, [0.52, 0.62 + index * 0.16, 0.42], "#6a7075", [blackbird.x + x, 0.32 + index * 0.08, blackbird.z + 0.78 + index * 0.54]);
  });
  [-1.35, 0.05, 1.45].forEach((x, index) => {
    addBox(landmarks, [0.58, 0.86 + index * 0.22, 0.5], "#244d69", [eveleigh.x + x, 0.43 + index * 0.11, eveleigh.z - 0.85 + index * 0.42]);
  });
  [-1.08, -0.25, 0.6, 1.38].forEach((x, index) => {
    addBox(landmarks, [0.5, 0.48 + index * 0.09, 0.42], "#efe1bf", [bondiJunction.x + x, 0.24 + index * 0.045, bondiJunction.z + 1.2 - (index % 2) * 0.5]);
  });

  const foamMaterial = new THREE.MeshBasicMaterial({ color: "#f8fbf0", transparent: true, opacity: 0.82 });
  for (let i = 0; i < 6; i += 1) {
    addBox(landmarks, [0.065, 0.035, 1.8 + i * 0.13], foamMaterial, [bondiBeach.x + 2.28 + i * 0.16, 0.12, bondiBeach.z - 1.46 + i * 0.62], [0, -0.14, 0]);
  }

  const surfColors = ["#fff4bd", "#e6533f", "#2f8ec7", "#22d66f", "#f7d35f"];
  for (let i = 0; i < 6; i += 1) {
    addBox(landmarks, [0.34, 0.055, 1.42], surfColors[i % surfColors.length], [bondiBeach.x - 0.9 + i * 0.27, 0.15, bondiBeach.z + 1.0 + i * 0.34], [0, i * 0.22 - 0.48, 0], { roughness: 0.54 });
  }
  const bondiPool = new THREE.Group();
  bondiPool.position.set(bondiBeach.x + 1.65, 0, bondiBeach.z + 1.62);
  bondiPool.rotation.y = -0.28;
  addBox(bondiPool, [1.34, 0.055, 0.88], "#fffdf4", [0, 0.14, 0], [0, 0, 0], { roughness: 0.48 });
  addBox(bondiPool, [1.1, 0.04, 0.68], "#74d7e8", [0, 0.18, 0], [0, 0, 0], { roughness: 0.16, metalness: 0.03 });
  [-0.24, 0, 0.24].forEach((z) => {
    addBox(bondiPool, [1.04, 0.018, 0.018], foamMaterial, [0, 0.21, z]);
  });
  addBox(bondiPool, [0.18, 0.34, 0.94], "#d8c494", [-0.78, 0.32, 0], [0, 0, 0], { roughness: 0.72 });
  addBox(bondiPool, [0.62, 0.08, 0.36], "#e8d9b6", [-1.05, 0.18, 0.36], [0, 0.12, 0], { roughness: 0.78 });
  landmarks.add(bondiPool);
  [-0.65, -0.24, 0.18, 0.58].forEach((offset, index) => {
    addBox(
      landmarks,
      [0.4, 0.045, 0.78],
      index % 2 ? "#e6533f" : "#f7d35f",
      [bondiBeach.x - 0.85 + offset, 0.16, bondiBeach.z - 0.06 + index * 0.2],
      [0, -0.48 + index * 0.18, 0],
      { roughness: 0.54 },
    );
  });

  const cliffMaterial = modelMaterial("#bda474", { roughness: 0.86 });
  for (let i = 0; i < 5; i += 1) {
    addBox(landmarks, [0.86, 0.62 + i * 0.1, 1.18], cliffMaterial, [doverHeights.x - 1.5 + i * 0.35, 0.31 + i * 0.05, doverHeights.z + 0.05 + i * 0.34], [0, -0.18, 0]);
  }

  const pitchLine = new THREE.MeshBasicMaterial({ color: "#f9f6e9" });
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 4.3), pitchLine);
  centerLine.position.set(pitchCenter.x, 0.11, pitchCenter.z);
  landmarks.add(centerLine);
  const centerCircle = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.025, 8, 64), pitchLine);
  centerCircle.rotation.x = Math.PI / 2;
  centerCircle.position.set(pitchCenter.x, 0.12, pitchCenter.z);
  landmarks.add(centerCircle);
  [pitchCenter.x - 2.78, pitchCenter.x + 2.78].forEach((x) => {
    const goal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 1.6), pitchLine);
    goal.position.set(x, 0.35, pitchCenter.z);
    landmarks.add(goal);
  });

  const gymMaterial = new THREE.MeshStandardMaterial({ color: "#252825", roughness: 0.45, metalness: 0.2 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 14), gymMaterial);
  bar.position.set(queensPark.x + 3.35, 0.45, queensPark.z + 0.35);
  bar.rotation.z = Math.PI / 2;
  bar.castShadow = true;
  landmarks.add(bar);
  [-2.25, 2.25].forEach((x) => {
    for (let i = 0; i < 3; i += 1) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.42 - i * 0.05, 0.42 - i * 0.05, 0.13, 28), gymMaterial);
      plate.position.set(queensPark.x + 3.35 + x + i * 0.12 * Math.sign(x), 0.45, queensPark.z + 0.35);
      plate.rotation.z = Math.PI / 2;
      plate.castShadow = true;
      landmarks.add(plate);
    }
  });

  const schoolLine = new THREE.MeshBasicMaterial({ color: "#fffdf4" });
  addBox(landmarks, [3.2, 0.035, 0.08], schoolLine, [queensPark.x, 0.13, queensPark.z - 0.98]);
  addBox(landmarks, [0.08, 0.035, 2.1], schoolLine, [queensPark.x - 1.58, 0.13, queensPark.z + 0.02]);
  addBox(landmarks, [0.08, 0.035, 2.1], schoolLine, [queensPark.x + 1.58, 0.13, queensPark.z + 0.02]);

  landmarks.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  addLandmarkSign(scene, addTexture, "Harbour Bridge", "north-west span", harbourBridge.x - 1.4, harbourBridge.z + 1.45, "#9fb2bd");
  addLandmarkSign(scene, addTexture, "North Sydney", "other side of the bridge", northSydney.x - 1.35, northSydney.z + 1.28, "#7da3a9");
  addLandmarkSign(scene, addTexture, "Milsons Point", "bridge landing", milsonsPoint.x + 1.4, milsonsPoint.z + 1.05, "#f0c36a");
  addLandmarkSign(scene, addTexture, "Sydney Opera House", "Bennelong Point", operaHouse.x + 0.7, operaHouse.z + 1.75, "#fff1bf");
  addLandmarkSign(scene, addTexture, "CBD", "city core", cbd.x + 1.45, cbd.z + 2, "#7da3a9");
  addLandmarkSign(scene, addTexture, "Surry Hills", "Blackbird block", blackbird.x + 1.65, blackbird.z - 0.45, "#22d66f");
  addLandmarkSign(scene, addTexture, "Eveleigh", "Quantium data yard", eveleigh.x + 1.35, eveleigh.z + 1.35, "#2f8ec7");
  addLandmarkSign(scene, addTexture, "Bondi Junction", "spreadsheet campus", bondiJunction.x + 0.65, bondiJunction.z - 1.35, "#18b96f");
  addLandmarkSign(scene, addTexture, "Queens Park", "Moriah College", queensPark.x - 1.15, queensPark.z - 1.35, "#ff5b2e");
  addLandmarkSign(scene, addTexture, "Dover Heights", "home base", doverHeights.x - 1.25, doverHeights.z + 1.35, "#f0c36a");
  addLandmarkSign(scene, addTexture, "Bondi Beach", "eastern surf strip", bondiBeach.x - 0.6, bondiBeach.z + 2.55, "#4cbad8");
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
    new THREE.SphereGeometry(PLAYER_BALL_RADIUS, 48, 24),
    new THREE.MeshStandardMaterial({ color: "#f8f7ef", roughness: 0.46 }),
  );
  ball.castShadow = true;
  group.add(ball);
  group.userData.colliderRadius = PLAYER_BALL_RADIUS;

  const patchMaterial = new THREE.MeshBasicMaterial({ color: "#151713", side: THREE.DoubleSide });
  const patchBaseNormal = new THREE.Vector3(0, 0, 1);
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
    const patch = new THREE.Mesh(new THREE.CircleGeometry(PLAYER_BALL_RADIUS * 0.31, 5), patchMaterial);
    patch.position.copy(normal.clone().multiplyScalar(PLAYER_BALL_RADIUS + 0.004));
    patch.quaternion.setFromUnitVectors(patchBaseNormal, normal);
    ball.add(patch);
  });

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
      if (event.key !== "Escape") return;
      if (document.fullscreenElement === mapShellRef.current) {
        void document.exitFullscreen().catch(() => {
          setIsMapFullscreen(false);
        });
        return;
      }
      if (!document.fullscreenElement) {
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

  useEffect(() => {
    if (!detailsOpen) return undefined;

    const closeDetailsOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) {
        setDetailMode("closed");
        setDismissedZoneId(activeId);
      }
    };

    document.addEventListener("keydown", closeDetailsOnEscape);
    return () => document.removeEventListener("keydown", closeDetailsOnEscape);
  }, [activeId, detailsOpen]);

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
    const mapShell = mapShellRef.current;

    if (!isMapFullscreen) {
      setIsMapFullscreen(true);
      void mapShell?.requestFullscreen?.().catch(() => {
        setIsMapFullscreen(true);
      });
      return;
    }

    setIsMapFullscreen(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        setIsMapFullscreen(false);
      });
    }
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
            {mapShortcutButtons.map(({ id, label, Icon }) => (
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
          <h2 id="archive-title">The full trail lives here, and the map now has corners for the rest.</h2>
          <p>
            Main builds sit as landmarks; older experiments gather in the graveyard and learning
            repos live around the learning centre without crowding the harbour.
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
          {filteredProjects.map((project) => {
            const imageSrc = projectImageSrc(project);

            return (
              <button
                className={`archive-card ${project.id === activeId ? "is-active" : ""}`}
                key={project.id}
                type="button"
                onClick={() => openProjectDetails(project.id, true)}
                style={{ "--project-color": project.color } as CSSProperties}
              >
                <span className="archive-thumb" aria-hidden="true">
                  <Image
                    src={imageSrc}
                    alt=""
                    width={480}
                    height={270}
                    sizes="(max-width: 760px) 92vw, (max-width: 1180px) 45vw, 280px"
                    unoptimized={isSvgImage(imageSrc)}
                  />
                </span>
                <span className="archive-year">{project.year}</span>
                <strong>{project.title}</strong>
                <small>{project.category} / {tierLabel(project.tier)}</small>
                <p>{project.summary}</p>
              </button>
            );
          })}
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
  const imageSrc = projectImageSrc(project);

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
        <Image
          src={imageSrc}
          alt={projectImageAlt(project)}
          width={720}
          height={430}
          sizes="(max-width: 760px) 88vw, 360px"
          loading="eager"
          unoptimized={isSvgImage(imageSrc)}
        />
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
