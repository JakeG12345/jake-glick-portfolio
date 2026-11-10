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
  ProjectLink,
  ProjectTier,
  projects,
  projectImageSrc,
  projectImageAlt,
  isSvgImage,
  featuredProject,
} from "./data/projects";
import cityData from "./data/city.json";
import siteData from "./data/site.json";

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

// Copy comes from site.json (editable in /studio); icons stay in code.
const contactIcons: Record<string, typeof Mail> = {
  Email: Mail,
  GitHub: Code2,
  LinkedIn: BriefcaseBusiness,
};
const contactLinks = siteData.contactLinks.map((link) => ({
  ...link,
  Icon: contactIcons[link.label] ?? Globe2,
}));

const landmarkButtons = [
  { id: "portfolio", label: "Town Hall", Icon: Building2 },
  { id: "sydney-harbour", label: "Opera House", Icon: Landmark },
  { id: "bondi-beach", label: "Bondi", Icon: Waves },
  { id: "dover-heights-home", label: "Home", Icon: MapPin },
  { id: "moriah-college", label: "Moriah", Icon: BriefcaseBusiness },
  { id: "quantium-work-experience", label: "Quantium", Icon: BriefcaseBusiness },
  { id: "whatsapp-wrapped", label: "Blackbird", Icon: BriefcaseBusiness },
];

// Projects are imported from ./data/projects to keep the scene component small
// and maintainable. See app/data/projects.ts for the full data set.

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

// One description of the crossing, shared by the model, the walkable area and
// the ball's height, so the deck you see is the deck you roll on.
const HARBOUR_BRIDGE = {
  south: { x: sydneyPlaces.harbourBridge.x - 0.1, z: sydneyPlaces.harbourBridge.z + 2.95 },
  north: { x: sydneyPlaces.harbourBridge.x + 0.4, z: sydneyPlaces.harbourBridge.z - 0.3 },
  deckY: 0.72,
  deckWidth: 1.85,
  rampLength: 1.9,
};

/**
 * Height of the bridge deck at a world point, and how far outside the deck the
 * point is. Distance is 0 on the deck and grows past its edges so the caller can
 * decide whether the ball is on the bridge at all.
 */
function harbourBridgeSurface(x: number, z: number) {
  const { south, north, deckY, deckWidth, rampLength } = HARBOUR_BRIDGE;
  const axisX = north.x - south.x;
  const axisZ = north.z - south.z;
  const span = Math.hypot(axisX, axisZ);
  if (span < 0.01) return { height: 0, distance: Number.POSITIVE_INFINITY };
  const ux = axisX / span;
  const uz = axisZ / span;
  const along = (x - south.x) * ux + (z - south.z) * uz;
  const across = Math.abs((x - south.x) * -uz + (z - south.z) * ux);
  const sideDistance = Math.max(0, across - deckWidth / 2);
  if (along < -rampLength || along > span + rampLength) {
    return { height: 0, distance: Number.POSITIVE_INFINITY };
  }
  let height = deckY;
  if (along < 0) height = deckY * (1 + along / rampLength);
  else if (along > span) height = deckY * (1 - (along - span) / rampLength);
  return { height: Math.max(0, height), distance: sideDistance };
}

/** Walkable surface height at a point: flat ground everywhere but the bridge. */
function surfaceHeightAt(x: number, z: number) {
  const bridge = harbourBridgeSurface(x, z);
  return bridge.distance === 0 ? bridge.height : 0;
}

// Plots are spaced so that no two models (or their placards) overlap when seen
// from the fixed camera: every pair clears the sum of their footprint radii
// plus room for a placard.
const cityProjectPlots = {
  whatsappWrapped: nudgePoint(sydneyPlaces.blackbird, 4.76, 1.99),
  jashby: nudgePoint(sydneyPlaces.bondiJunction, 5.9, -3.85),
  quantium: nudgePoint(sydneyPlaces.eveleigh, -5.85, 3.4),
  // Swapped with Car Lifestory: the house takes the seaward plot.
  doverHome: nudgePoint(sydneyPlaces.doverHeights, 6.24, 2.05),
  // Out on the shoreline notch, so the diorama's surf meets the open water
  // rather than sitting in the middle of the suburb.
  bondiBeach: nudgePoint(sydneyPlaces.bondiBeach, 4.3, -0.33),
  // On Bennelong Point rather than out in the shipping channel.
  sydneyHarbour: nudgePoint(sydneyPlaces.operaHouse, 2.2, 0.9),
  carLifestory: nudgePoint(sydneyPlaces.doverHeights, 2.45, -2.45),
  whatThePuck: nudgePoint(sydneyPlaces.sportsField, 6.05, 3.6),
  moriahJiuJitsu: nudgePoint(sydneyPlaces.queensPark, -1.54, -3.27),
  moriahCollege: nudgePoint(sydneyPlaces.bondiJunction, 4.5, 1.25),
  degree6: nudgePoint(sydneyPlaces.centralStation, -7.25, -2.85),
  ideaAid: nudgePoint(sydneyPlaces.queensPark, -6.75, 5.15),
  // Town Hall, in the city core where a town hall belongs.
  portfolio: nudgePoint(sydneyPlaces.cbd, -3.15, 2.35),
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

// Map stops are assembled from city.json so the /studio editor can rewrite the
// copy, while the plot coordinates stay here as derived geography.
type CityEntry = {
  id: string;
  base: "featured" | "standalone";
  plot: keyof typeof cityProjectPlots;
  height: number;
  heading?: number;
  content: Record<string, unknown>;
};

const cityItems: Project[] = (cityData as CityEntry[]).map((entry) => {
  const placed = {
    ...entry.content,
    ...cityProjectPlots[entry.plot],
    height: entry.height,
    ...(entry.heading === undefined ? {} : { heading: entry.heading }),
  };
  return entry.base === "featured"
    ? featuredProject(entry.id, placed as Partial<Project>)
    : ({ id: entry.id, ...placed } as Project);
});

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
  2.4,
  2.1,
  "graveyard",
);
const learningCentreMapItems = layoutArchiveZoneProjects(
  learningCentreProjects,
  // Sits in front of the campus hall rather than underneath it.
  nudgePoint(archiveDistricts.learningCentre.center, 0, 0.95),
  8,
  1.42,
  1.9,
  "learning",
);
const mapItems = [...cityItems, ...graveyardMapItems, ...learningCentreMapItems];
const mapItemIds = new Set(mapItems.map((item) => item.id));
const selectableItems = [
  ...mapItems,
  ...projects.filter((project) => !mapItemIds.has(project.id)),
];
// Landmarks are places to walk to, not work to read about, so they travel the
// camera without opening a detail card.
const landmarkStopIds = new Set(
  mapItems.filter((item) => item.category === "Landmark").map((item) => item.id),
);
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

const experiences = siteData.experiences;

const cityStats = [
  [siteData.stats.repos, "public GitHub repos"],
  [String(mapItems.length), "map stops"],
  [String(projects.length), "archive items"],
  [siteData.stats.gradYear, siteData.stats.gradLabel],
];

const filters = ["All", "Product", "Game", "Mobile", "Data story", "Learning"] as const;
const PLAYER_BALL_RADIUS = 0.36;
const PLAYER_SPEED = 11.2;

// The camera keeps a fixed offset from the player, so the bearing it looks from
// never changes. Plaques are built facing that bearing instead of turning to
// chase the player every frame.
const CAMERA_VIEWS = {
  wide: { offset: { x: 8.1, y: 16.4, z: 13.7 }, look: { x: 0.9, y: 1.05, z: -1.05 } },
  narrow: { offset: { x: 12.6, y: 21.4, z: 18.6 }, look: { x: 1.65, y: 1.05, z: -0.55 } },
} as const;
const cameraYaw = (view: (typeof CAMERA_VIEWS)[keyof typeof CAMERA_VIEWS]) =>
  Math.atan2(view.offset.x, view.offset.z);
// Tilt the plaque face up toward the raised camera so it reads flat on screen.
const PLAQUE_TILT = -0.42;
const PLAYER_BOUNDS = {
  minX: -27.2 + PLAYER_BALL_RADIUS,
  maxX: 33.0 - PLAYER_BALL_RADIUS,
  minZ: -26.6 + PLAYER_BALL_RADIUS,
  maxZ: 24.9 - PLAYER_BALL_RADIUS,
};
const MOVEMENT_KEYS = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
const JUMP_SPEED = 5.4;
const GRAVITY = 15.5;
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
  { start: sydneyPlaces.milsonsPoint, end: sydneyPlaces.harbourBridge, width: 0.5, walkWidth: 1.4, kind: "bridge" },
  { start: sydneyPlaces.northSydney, end: sydneyPlaces.milsonsPoint, width: 0.13, kind: "rail" },
  { start: sydneyPlaces.milsonsPoint, end: sydneyPlaces.harbourBridge, width: 0.13, kind: "rail" },
  { start: sydneyPlaces.harbourBridge, end: sydneyPlaces.operaHouse, width: 0.48, walkWidth: 1.35, kind: "bridge" },
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

function addPrism(
  parent: THREE.Object3D,
  size: [number, number, number],
  materialOrColor: THREE.Material | string,
  position: [number, number, number],
  rotationY = 0,
) {
  // Triangular prism with its ridge along local z; position is the centre of the base.
  const [width, height, depth] = size;
  const material = typeof materialOrColor === "string" ? modelMaterial(materialOrColor) : materialOrColor;
  const shape = new THREE.Shape([
    new THREE.Vector2(-width / 2, 0),
    new THREE.Vector2(width / 2, 0),
    new THREE.Vector2(0, height),
  ]);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.y = rotationY;
  parent.add(mesh);
  return mesh;
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
  if (project.id === "moriah-college") return createMoriahCollegeModel(project);
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
  const screen = modelMaterial("#0f2a1c", { roughness: 0.3, metalness: 0.1 });

  addBox(group, [2.7, 0.16, 2.0], "#16201a", [0, 0.08, 0.1]);

  // A giant phone, leaning back so the chat reads from the camera side.
  const phone = new THREE.Group();
  phone.position.set(0.25, 0.16, -0.42);
  phone.rotation.x = -0.16;
  group.add(phone);
  const tall = project.height - 0.45;
  addBox(phone, [1.74, tall, 0.26], dark, [0, tall / 2, 0]);
  addBox(phone, [1.52, tall - 0.3, 0.04], screen, [0, tall / 2, 0.14]);
  addBox(phone, [1.52, 0.4, 0.05], green, [0, tall - 0.42, 0.145]);
  addBox(phone, [0.42, 0.08, 0.06], dark, [0, tall - 0.2, 0.15]);
  addCylinder(phone, 0.12, 0.12, 0.05, card, [-0.52, tall - 0.42, 0.17], [Math.PI / 2, 0, 0], 16);
  ([
    [-0.22, 0.98, false],
    [0.26, 0.82, true],
    [-0.3, 0.8, false],
    [0.18, 1.0, true],
    [-0.12, 1.16, false],
  ] as const).forEach(([x, width, mine], index) => {
    const y = tall - 1.02 - index * 0.5;
    addBox(phone, [width, 0.32, 0.06], mine ? green : card, [x, y, 0.16]);
    addBox(phone, [0.12, 0.12, 0.06], mine ? green : card, [x + (mine ? 1 : -1) * (width / 2 - 0.04), y - 0.14, 0.16], [0, 0, 0.78]);
  });
  // Kickstand, so it reads as an object rather than a wall.
  addBox(phone, [0.5, tall * 0.62, 0.08], dark, [0, tall * 0.3, -0.52], [0.36, 0, 0]);

  // The Wrapped recap: fanned cards and a podium chart out the front.
  ([
    [-1.05, 0.8, -0.34, "#fffdf4"],
    [-0.74, 0.94, 0.0, project.color],
    [-0.4, 1.08, 0.34, "#f7d35f"],
  ] as const).forEach(([x, height, lean, colour], index) => {
    addBox(group, [0.56, height, 0.05], colour, [x, 0.16 + height / 2, 0.62 + index * 0.1], [-0.1, 0.42 + lean, 0], {
      roughness: 0.5,
    });
  });
  ([0.24, 0.46, 0.76, 0.5] as const).forEach((height, index) => {
    addBox(group, [0.17, height, 0.17], index === 2 ? "#f7d35f" : index % 2 ? "#83f6aa" : green, [0.52 + index * 0.25, 0.16 + height / 2, 0.84]);
  });
  addBox(group, [1.12, 0.05, 0.32], card, [0.9, 0.185, 0.84]);

  // Notification badge on the top corner.
  addSphere(group, 0.3, green, [1.08, project.height + 0.02, -0.92], 18);
  addSphere(group, 0.1, card, [1.08, project.height + 0.04, -0.66], 10);
  return group;
}

function createJashbyModel(project: Project) {
  const group = new THREE.Group();
  const greenGlass = modelMaterial("#18b96f", { roughness: 0.24, metalness: 0.12 });
  const paleGlass = modelMaterial("#63dda4", { roughness: 0.26, metalness: 0.1 });
  const trim = modelMaterial("#f6fff2", { roughness: 0.5 });
  const total = project.height;

  // The tower steps back like a column chart, so the silhouette says
  // "spreadsheet" before any facade detail is readable.
  ([
    [2.3, 1.4, total * 0.46, 0, greenGlass],
    [1.78, 1.12, total * 0.31, total * 0.46, paleGlass],
    [1.24, 0.86, total * 0.23, total * 0.77, greenGlass],
  ] as const).forEach(([width, depth, height, y, material]) => {
    addBox(group, [width, height, depth], material, [0, y + height / 2, 0]);
    addBox(group, [width + 0.15, 0.09, depth + 0.15], trim, [0, y + height, 0]);
  });
  addFacadeGrid(group, 2.3, total * 0.46, 1.4, 3, 4, "#dffff0", 0.55);

  // The cell cursor: Jashby's one unmistakable mark.
  const cursor = new THREE.Group();
  cursor.position.set(0.26, total * 0.6, 0.58);
  addBox(cursor, [0.62, 0.4, 0.05], "#f7d35f", [0, 0, 0], [0, 0, 0], { roughness: 0.42 });
  addBox(cursor, [0.5, 0.28, 0.06], "#123d2a", [0, 0, 0.015]);
  addBox(cursor, [0.12, 0.12, 0.05], "#f7d35f", [0.34, -0.22, 0.01]);
  group.add(cursor);

  // A sheet of cells laid out on the plot in front of the tower.
  const lineMaterial = new THREE.MeshBasicMaterial({ color: "#219760" });
  const cellMaterial = new THREE.MeshBasicMaterial({ color: "#dffff0" });
  addBox(group, [2.32, 0.05, 1.24], "#fffdf4", [0.06, 0.05, 1.14]);
  for (let col = 0; col < 5; col += 1) {
    addBox(group, [0.02, 0.03, 1.18], lineMaterial, [-0.78 + col * 0.39, 0.08, 1.14]);
  }
  for (let row = 0; row < 3; row += 1) {
    addBox(group, [2.26, 0.03, 0.02], lineMaterial, [0.06, 0.08, 0.7 + row * 0.42]);
  }
  ([[-0.58, 0.9], [0.2, 1.32], [0.98, 0.9]] as const).forEach(([x, z]) => {
    addBox(group, [0.3, 0.025, 0.3], cellMaterial, [x, 0.085, z]);
  });

  addBox(group, [0.14, 0.72, 0.12], "#f7d35f", [0.66, total + 0.36, 0]);
  return group;
}

function createQuantiumModel(project: Project) {
  const group = new THREE.Group();
  const glass = modelMaterial("#2f8ec7", { roughness: 0.2, metalness: 0.18 });
  const darkGlass = modelMaterial("#17476c", { roughness: 0.24, metalness: 0.2 });
  const trim = modelMaterial("#d9eff7", { roughness: 0.44 });
  const total = project.height;

  // Two offset slabs with a glazed spine between them: a corporate tower that
  // still has a silhouette from across the map.
  addBox(group, [1.28, total * 0.94, 1.12], glass, [-0.34, total * 0.47, 0]);
  addBox(group, [0.92, total, 0.86], darkGlass, [0.52, total / 2, -0.1]);
  addBox(group, [0.26, total * 0.86, 0.5], trim, [0.06, total * 0.43, 0.42]);
  addBox(group, [1.42, 0.14, 1.26], trim, [-0.34, total * 0.94 + 0.07, 0]);
  addBox(group, [1.04, 0.14, 0.98], trim, [0.52, total + 0.07, -0.1]);

  // Window banding rather than a dot grid: cheaper and reads at map scale.
  const bandMaterial = new THREE.MeshBasicMaterial({ color: "#aee7ff" });
  for (let i = 0; i < 6; i += 1) {
    const y = 0.62 + i * (total * 0.94 - 0.9) / 5;
    addBox(group, [1.3, 0.14, 1.14], bandMaterial, [-0.34, y, 0]);
  }
  for (let i = 0; i < 7; i += 1) {
    const y = 0.5 + i * (total - 0.8) / 6;
    addBox(group, [0.94, 0.1, 0.88], bandMaterial, [0.52, y, -0.1]);
  }

  // The roof chart: the cue that this stop is about data.
  ([0.34, 0.8, 0.52, 1.2, 0.68] as const).forEach((height, index) => {
    const barColor = index === 3 ? "#f7d35f" : "#aee7ff";
    addBox(group, [0.2, height, 0.2], barColor, [-0.86 + index * 0.26, total * 0.94 + height / 2 + 0.14, 0.06]);
  });
  addBox(group, [1.5, 0.05, 0.05], trim, [-0.34, total * 0.94 + 0.16, 0.06]);

  // A scatter plot laid out on the plaza in front.
  addBox(group, [1.5, 0.05, 1.05], "#101a22", [-0.1, 0.06, 1.32], [0, 0.16, 0]);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: "#aee7ff" });
  ([
    [-0.5, -0.28], [-0.26, 0.02], [-0.02, -0.12], [0.16, 0.22], [0.42, 0.06], [0.56, -0.24],
  ] as const).forEach(([dx, dz], index) => {
    addSphere(group, index === 3 ? 0.09 : 0.06, index === 3 ? "#f7d35f" : dotMaterial, [-0.1 + dx, 0.13, 1.32 + dz], 10);
  });
  addBox(group, [1.28, 0.02, 0.03], "#f7d35f", [-0.1, 0.1, 1.32], [0, 0.16, -0.2]);

  const dataOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.022, 8, 60),
    new THREE.MeshBasicMaterial({ color: "#aee7ff", transparent: true, opacity: 0.6 }),
  );
  dataOrbit.rotation.set(Math.PI / 2, 0.28, 0.15);
  dataOrbit.position.set(-0.1, total + 0.36, 0);
  group.add(dataOrbit);
  return group;
}

function createDegree6Model(project: Project) {
  const group = new THREE.Group();
  const nodeMaterial = modelMaterial("#b9a9ff", { emissive: "#1b0d4a", emissiveIntensity: 0.18 });
  const hubMaterial = modelMaterial("#fff8dc", { emissive: "#3a2d78", emissiveIntensity: 0.2 });
  const edgeMaterial = modelMaterial("#8f7fe0", { roughness: 0.34, metalness: 0.14 });

  addBox(group, [2.5, 0.16, 2.2], "#171925", [0, 0.08, 0], [0, 0.18, 0]);

  // The model IS the graph: six rings of connections spreading out from you.
  const hub = new THREE.Vector3(0, 1.62, 0);
  addCylinder(group, 0.16, 0.28, 1.5, modelMaterial(project.color, { roughness: 0.4 }), [0, 0.87, 0], [0, 0, 0], 18);
  addSphere(group, 0.26, hubMaterial, [hub.x, hub.y, hub.z], 24);

  const rings = [
    { count: 4, radius: 0.62, y: 1.34, size: 0.13 },
    { count: 6, radius: 1.0, y: 0.92, size: 0.11 },
    { count: 7, radius: 1.28, y: 0.5, size: 0.09 },
  ];
  let previous: THREE.Vector3[] = [hub];
  rings.forEach((ring, ringIndex) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.42;
      const point = new THREE.Vector3(
        Math.cos(angle) * ring.radius,
        ring.y,
        Math.sin(angle) * ring.radius,
      );
      points.push(point);
      addSphere(group, ring.size, nodeMaterial, [point.x, point.y, point.z], 14);
      const parent = previous[i % previous.length];
      addCylinderBetween(group, parent, point, 0.022 - ringIndex * 0.004, edgeMaterial);
      // A few sideways links so it reads as a network, not a tree.
      if (i > 0 && i % 2 === 0) {
        addCylinderBetween(group, points[i - 1], point, 0.014, edgeMaterial);
      }
    }
    previous = points;
  });

  // The one highlighted path: six hops, the thing the app is named for.
  const trailColour = modelMaterial("#f7d35f", { emissive: "#5a4210", emissiveIntensity: 0.25 });
  const trail = [hub, new THREE.Vector3(0.62, 1.34, 0.1), new THREE.Vector3(0.86, 0.92, 0.5), new THREE.Vector3(1.1, 0.5, 0.64)];
  trail.forEach((point, index) => {
    if (index === 0) return;
    addCylinderBetween(group, trail[index - 1], point, 0.03, trailColour);
    addSphere(group, 0.12, trailColour, [point.x, point.y, point.z], 14);
  });
  return group;
}

function createGarageModel(project: Project) {
  const group = new THREE.Group();
  const wall = modelMaterial("#f4e4bd", { roughness: 0.7 });
  const roof = modelMaterial(project.color, { roughness: 0.42, metalness: 0.12 });
  const tyre = modelMaterial("#171713", { roughness: 0.7 });

  addBox(group, [2.9, 0.1, 2.7], "#2b2e2a", [0, 0.05, 0.1]);

  // Workshop with the roller door open toward the camera.
  addBox(group, [2.4, 1.0, 1.25], wall, [0, 0.6, -0.55]);
  addBox(group, [2.64, 0.16, 1.5], roof, [0, 1.18, -0.5]);
  addBox(group, [2.64, 0.26, 0.1], roof, [0, 1.05, 0.22]);
  addBox(group, [1.36, 0.74, 0.08], "#1c2322", [-0.3, 0.47, 0.08]);
  addBox(group, [1.36, 0.12, 0.12], "#c9c9c0", [-0.3, 0.86, 0.1]);
  addBox(group, [0.44, 0.34, 0.06], "#aee5f5", [0.82, 0.62, 0.09]);
  addBox(group, [0.9, 0.2, 0.05], "#fffdf4", [-0.3, 1.05, 0.28]);
  addBox(group, [0.56, 0.06, 0.06], "#d22f2f", [-0.3, 1.05, 0.31]);

  // The car, nose out on the driveway.
  const car = new THREE.Group();
  car.position.set(-0.3, 0.1, 0.92);
  group.add(car);
  addBox(car, [0.8, 0.24, 1.5], "#d22f2f", [0, 0.26, 0], [0, 0, 0], { roughness: 0.36, metalness: 0.2 });
  addBox(car, [0.68, 0.24, 0.74], "#93d8ff", [0, 0.48, -0.12], [0, 0, 0], { roughness: 0.2, metalness: 0.1 });
  addBox(car, [0.7, 0.05, 0.7], "#b02222", [0, 0.62, -0.12]);
  [-0.42, 0.42].forEach((x) => {
    [-0.46, 0.48].forEach((z) => {
      addCylinder(car, 0.16, 0.16, 0.12, tyre, [x, 0.16, z], [0, 0, Math.PI / 2], 16);
      addCylinder(car, 0.07, 0.07, 0.13, "#c9c9c0", [x, 0.16, z], [0, 0, Math.PI / 2], 10);
    });
    addBox(car, [0.14, 0.07, 0.04], "#fff3b0", [x * 0.62, 0.3, 0.76]);
  });

  // The life story: a service timeline running along the kerb.
  addBox(group, [0.05, 0.03, 2.2], "#fffdf4", [1.08, 0.115, 0.3]);
  (["#f7d35f", "#4cbad8", "#22d66f", "#e6533f"] as const).forEach((colour, index) => {
    const z = -0.56 + index * 0.6;
    addCylinder(group, 0.13, 0.13, 0.06, colour, [1.08, 0.14, z], [0, 0, 0], 16);
    addBox(group, [0.3, 0.2 + index * 0.08, 0.04], "#fffdf4", [1.08, 0.3 + index * 0.04, z], [0, 0.5, 0]);
  });
  return group;
}

function createPuckModel(project: Project) {
  const group = new THREE.Group();
  const board = modelMaterial("#fffdf4", { roughness: 0.5 });
  const red = modelMaterial("#e95344", { roughness: 0.5 });
  const blue = new THREE.MeshBasicMaterial({ color: project.color });

  // Golf crossed with ice hockey: a rink with a putting flag in it.
  addBox(group, [3.0, 0.1, 2.0], "#3c4a52", [0, 0.05, 0]);
  addBox(group, [2.76, 0.1, 1.76], "#d8f1ff", [0, 0.12, 0], [0, 0, 0], { roughness: 0.14, metalness: 0.04 });
  ([[0, -0.93, 2.9, 0.1], [0, 0.93, 2.9, 0.1], [-1.43, 0, 0.1, 1.86], [1.43, 0, 0.1, 1.86]] as const).forEach(
    ([x, z, width, depth]) => {
      addBox(group, [width, 0.3, depth], board, [x, 0.27, z]);
      addBox(group, [width + 0.02, 0.06, depth + 0.02], blue, [x, 0.45, z]);
    },
  );
  addBox(group, [0.05, 0.012, 1.74], red, [0, 0.176, 0]);
  [-0.72, 0.72].forEach((x) => addBox(group, [0.05, 0.012, 1.74], blue, [x, 0.176, 0]));
  const circle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 6, 32), red);
  circle.rotation.x = Math.PI / 2;
  circle.position.set(0, 0.178, 0);
  group.add(circle);

  // The puck, mid-slide, with a streak behind it.
  addCylinder(group, 0.24, 0.24, 0.14, "#151713", [-0.36, 0.25, 0.22], [0, 0, 0], 24);
  addCylinder(group, 0.245, 0.245, 0.04, "#f7d35f", [-0.36, 0.25, 0.22], [0, 0, 0], 24);
  addBox(group, [0.7, 0.012, 0.1], "#fffdf4", [-0.9, 0.178, 0.36], [0, 0.26, 0]);

  // The hole and its flag.
  addCylinder(group, 0.13, 0.13, 0.02, "#151713", [0.86, 0.18, -0.3], [0, 0, 0], 20);
  addCylinder(group, 0.025, 0.025, 1.1, "#fffdf4", [0.86, 0.72, -0.3], [0, 0, 0], 8);
  addPrism(group, [0.46, 0.3, 0.03], "#f7d35f", [1.08, 1.0, -0.3]).rotation.z = -Math.PI / 2;

  // Net at one end, stick against the boards.
  addBox(group, [0.06, 0.44, 0.06], red, [-1.2, 0.39, -0.3]);
  addBox(group, [0.06, 0.44, 0.06], red, [-1.2, 0.39, 0.3]);
  addBox(group, [0.06, 0.06, 0.66], red, [-1.2, 0.6, 0]);
  addBox(group, [0.02, 0.4, 0.6], new THREE.MeshBasicMaterial({ color: "#fffdf4", transparent: true, opacity: 0.45 }), [-1.3, 0.38, 0]);
  addCylinderBetween(group, new THREE.Vector3(0.3, 0.2, 0.74), new THREE.Vector3(1.2, 0.86, 0.8), 0.03, "#8a6a45");
  addBox(group, [0.34, 0.07, 0.05], "#8a6a45", [0.16, 0.2, 0.72], [0, 0.2, 0]);
  return group;
}

function createMoriahCollegeModel(project: Project) {
  const group = new THREE.Group();
  const wall = modelMaterial("#f3ead6", { roughness: 0.72 });
  const brick = modelMaterial("#c98b62", { roughness: 0.82 });
  const roof = modelMaterial(project.color, { roughness: 0.5 });
  const glass = new THREE.MeshBasicMaterial({ color: "#9fd8ef" });
  const paving = modelMaterial("#d9d3c2", { roughness: 0.86 });

  addBox(group, [2.5, 0.1, 2.15], "#3b3f39", [0, 0.05, 0]);
  addBox(group, [1.6, 0.04, 0.86], paving, [0, 0.11, 0.24]);

  // Main hall with a gabled roof and a clock tower, set back behind the quad.
  addBox(group, [1.24, 0.62, 0.62], wall, [0, 0.41, -0.62]);
  addBox(group, [1.36, 0.09, 0.72], roof, [0, 0.76, -0.62]);
  addBox(group, [0.96, 0.09, 0.5], roof, [0, 0.85, -0.62]);
  addBox(group, [0.34, 0.3, 0.05], glass, [0, 0.5, -0.32]);
  addBox(group, [0.42, 0.05, 0.06], roof, [0, 0.7, -0.31]);
  addBox(group, [0.42, 0.78, 0.42], wall, [0, 1.19, -0.62]);
  addBox(group, [0.5, 0.07, 0.5], roof, [0, 1.61, -0.62]);
  addBox(group, [0.32, 0.24, 0.05], glass, [0, 1.32, -0.4]);
  addCylinder(group, 0.09, 0.14, 0.24, roof, [0, 1.76, -0.62], [0, 0, 0], 4);
  addCylinder(group, 0.014, 0.014, 0.22, "#e8e2d2", [0, 1.98, -0.62], [0, 0, 0], 6);

  // Classroom wings either side, brick with window rows.
  [-1, 1].forEach((side) => {
    const x = side * 0.86;
    addBox(group, [0.5, 0.46, 1.32], brick, [x, 0.33, -0.15], [0, side * 0.04, 0]);
    addBox(group, [0.58, 0.07, 1.4], wall, [x, 0.59, -0.15], [0, side * 0.04, 0]);
    for (let i = 0; i < 4; i += 1) {
      addBox(group, [0.05, 0.16, 0.2], glass, [x + side * 0.25, 0.36, -0.62 + i * 0.31]);
    }
  });

  // Quad: a tree, a bench and the flagpole.
  addCylinder(group, 0.05, 0.07, 0.24, "#6a4c32", [-0.34, 0.22, 0.28], [0, 0, 0], 8);
  addSphere(group, 0.24, "#3f7f45", [-0.34, 0.52, 0.28], 12).scale.set(1, 0.82, 1);
  addBox(group, [0.36, 0.05, 0.1], "#8a6a45", [0.36, 0.16, 0.2], [0, -0.3, 0]);
  addCylinder(group, 0.018, 0.018, 0.9, "#e8e2d2", [0.62, 0.55, -0.02], [0, 0, 0], 8);
  addBox(group, [0.03, 0.16, 0.26], roof, [0.62, 0.9, 0.12]);

  // Sports court out the front.
  addBox(group, [1.5, 0.04, 0.72], "#2f7d5c", [-0.08, 0.12, 0.86], [0, 0.03, 0]);
  addBox(group, [1.4, 0.02, 0.02], "#fffdf4", [-0.08, 0.15, 0.86]);
  addBox(group, [0.02, 0.02, 0.66], "#fffdf4", [-0.08, 0.15, 0.86]);
  [-0.78, 0.62].forEach((x) => {
    addCylinder(group, 0.012, 0.012, 0.3, "#1d201d", [x, 0.28, 0.86], [0, 0, 0], 6);
    addBox(group, [0.16, 0.02, 0.16], "#1d201d", [x, 0.43, 0.86]);
  });

  // Gate onto the street.
  [-0.62, 0.46].forEach((x) => {
    addBox(group, [0.12, 0.42, 0.12], brick, [x, 0.31, 1.28]);
  });
  addBox(group, [1.2, 0.08, 0.08], roof, [-0.08, 0.54, 1.28]);
  return group;
}

function createDojoModel(project: Project) {
  const group = new THREE.Group();
  const timber = modelMaterial("#7a4a2b", { roughness: 0.86 });
  const wall = modelMaterial("#f5ead0", { roughness: 0.72 });
  const roof = modelMaterial(project.color, { roughness: 0.45 });

  addBox(group, [2.62, 0.12, 2.0], "#252825", [0, 0.06, 0.12]);
  addBox(group, [2.24, 0.86, 1.0], wall, [0, 0.49, -0.5]);

  // Pitched dojo roof with deep eaves: the shape that carries at map scale.
  ([
    [2.66, 0.14, 1.34, 0.99],
    [2.24, 0.13, 1.02, 1.11],
    [1.72, 0.12, 0.7, 1.22],
  ] as const).forEach(([width, height, depth, y]) => {
    addBox(group, [width, height, depth], roof, [0, y, -0.5]);
  });
  addBox(group, [1.9, 0.07, 0.09], "#fffdf4", [0, 1.31, -0.5]);
  [-0.66, -0.22, 0.22, 0.66].forEach((x) => {
    addBox(group, [0.22, 0.26, 0.04], "#94d8e8", [x, 0.6, -0.99]);
  });
  addBox(group, [0.5, 0.56, 0.05], "#2b1d12", [0, 0.4, -0.02]);

  // Torii-style gate at the front of the mat.
  [-0.86, 0.86].forEach((x) => {
    addCylinder(group, 0.07, 0.085, 1.12, timber, [x, 0.62, 1.22], [0, 0, 0], 10);
  });
  addBox(group, [2.16, 0.1, 0.16], timber, [0, 1.22, 1.22]);
  addBox(group, [1.86, 0.08, 0.13], timber, [0, 1.04, 1.22]);
  addBox(group, [2.4, 0.09, 0.2], "#151713", [0, 1.32, 1.22]);

  // Competition mats, ringed in belt colours.
  addBox(group, [2.14, 0.05, 1.3], "#2f68c8", [0, 0.15, 0.5]);
  addBox(group, [1.66, 0.055, 0.96], project.color, [0, 0.17, 0.5]);
  addBox(group, [0.5, 0.06, 0.5], "#fffdf4", [0, 0.19, 0.5], [0, 0.78, 0]);
  ([["#151713", -0.78], ["#7a4a2b", -0.26], ["#2f68c8", 0.26], ["#e6533f", 0.78]] as const).forEach(([color, x]) => {
    addBox(group, [0.34, 0.04, 0.1], color, [x, 0.2, 1.06]);
  });
  return group;
}

function createIdeaAidModel(project: Project) {
  const group = new THREE.Group();
  const cortex = modelMaterial("#e59ab4", { roughness: 0.62 });
  const fold = modelMaterial("#c9718f", { roughness: 0.68 });
  const stem = modelMaterial("#b3607c", { roughness: 0.7 });
  const plinth = modelMaterial("#2a2630", { roughness: 0.74 });

  // A brain on a plinth: two hemispheres of stacked lobes, folded on top.
  addBox(group, [1.9, 0.16, 1.5], plinth, [0, 0.08, 0]);
  addBox(group, [1.5, 0.3, 1.1], modelMaterial(project.color, { roughness: 0.42 }), [0, 0.3, 0]);

  const centre = 0.98;
  [-1, 1].forEach((side) => {
    const hemi = new THREE.Group();
    hemi.position.set(0, centre, side * 0.3);
    group.add(hemi);
    addSphere(hemi, 0.52, cortex, [0, 0, 0], 20).scale.set(1.18, 0.86, 0.78);
    // Lobe bulges, biggest at the front, so the silhouette reads as a brain.
    ([
      [0.44, 0.16, 0.0, 0.25],
      [0.12, 0.3, 0.06, 0.28],
      [-0.26, 0.24, 0.02, 0.26],
      [-0.52, 0.02, -0.02, 0.22],
      [0.3, -0.12, 0.16, 0.2],
      [-0.06, -0.18, 0.18, 0.19],
    ] as const).forEach(([x, y, z, r]) => {
      addSphere(hemi, r, cortex, [x, y, z + side * 0.06], 14);
    });
    // Sulci: darker creases running front to back.
    ([-0.22, 0.06, 0.32] as const).forEach((y, index) => {
      addBox(hemi, [1.02 - index * 0.12, 0.045, 0.06], fold, [0, y + 0.22, side * 0.24], [0, side * 0.12, 0]);
    });
  });
  // The fissure between the hemispheres, and the stem below.
  addBox(group, [1.12, 0.5, 0.05], fold, [0, centre + 0.06, 0]);
  addCylinder(group, 0.14, 0.19, 0.36, stem, [-0.12, 0.58, 0], [0.16, 0, 0.1], 14);
  addSphere(group, 0.17, stem, [-0.26, 0.42, 0], 14).scale.set(1, 0.72, 1);

  // A couple of ideas sparking off it.
  ([
    [0.72, 1.66, 0.42],
    [-0.66, 1.72, -0.34],
  ] as const).forEach(([x, y, z], index) => {
    addCylinder(group, 0.02, 0.02, 0.3, "#f7d35f", [x, y - 0.2, z], [0, 0, index ? 0.3 : -0.3], 8);
    addSphere(group, 0.13, "#f7d35f", [x, y, z], 16);
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      addBox(group, [0.035, 0.13, 0.035], "#ffe9a6", [x + Math.cos(angle) * 0.2, y + 0.04, z + Math.sin(angle) * 0.2], [0, angle, 0.45]);
    }
  });
  return group;
}

function createCityHallModel(project: Project) {
  const group = new THREE.Group();
  const stone = modelMaterial("#f3e6c8", { roughness: 0.72 });
  const trim = modelMaterial("#d7c49b", { roughness: 0.78 });
  const gold = modelMaterial(project.color, { roughness: 0.4, metalness: 0.18 });

  // Steps climbing to the portico, which faces the camera.
  [0, 1, 2].forEach((step) => {
    addBox(group, [2.7 - step * 0.2, 0.1, 2.3 - step * 0.26], trim, [0, 0.05 + step * 0.1, 0.06 - step * 0.02]);
  });
  addBox(group, [2.16, 1.05, 1.3], stone, [0, 0.82, -0.18]);
  [-0.86, -0.52, -0.18, 0.18, 0.52, 0.86].forEach((x) => {
    addCylinder(group, 0.07, 0.08, 1.0, trim, [x, 0.8, 0.66], [0, 0, 0], 10);
  });
  addBox(group, [2.2, 0.12, 0.42], trim, [0, 1.36, 0.6]);
  addPrism(group, [2.2, 0.48, 0.42], stone, [0, 1.42, 0.6]);
  addBox(group, [2.3, 0.1, 1.44], trim, [0, 1.4, -0.18]);
  addBox(group, [0.36, 0.6, 0.06], "#3a2a1c", [0, 0.6, 0.48]);
  [-0.62, 0.62].forEach((x) => addBox(group, [0.24, 0.36, 0.05], "#9fd8ef", [x, 0.82, 0.48]));

  // Clock tower.
  addBox(group, [0.62, 1.2, 0.62], stone, [0, 2.0, -0.3]);
  addBox(group, [0.74, 0.08, 0.74], trim, [0, 2.62, -0.3]);
  addCylinder(group, 0.2, 0.2, 0.05, "#fffdf4", [0, 2.26, 0.03], [Math.PI / 2, 0, 0], 20);
  addCylinder(group, 0.2, 0.2, 0.05, "#fffdf4", [0.33, 2.26, -0.3], [0, 0, Math.PI / 2], 20);
  addBox(group, [0.03, 0.15, 0.02], "#151713", [0, 2.31, 0.065]);
  addBox(group, [0.11, 0.03, 0.02], "#151713", [0.04, 2.26, 0.065]);
  addBox(group, [0.46, 0.4, 0.46], stone, [0, 2.86, -0.3]);
  addSphere(group, 0.27, gold, [0, 3.08, -0.3], 16).scale.set(1, 0.85, 1);
  addCylinder(group, 0.02, 0.03, 0.5, gold, [0, 3.5, -0.3], [0, 0, 0], 8);
  addBox(group, [0.26, 0.15, 0.02], "#e6533f", [0.14, 3.66, -0.3]);
  return group;
}

function createHarbourModel(project: Project) {
  const group = new THREE.Group();
  const shellMaterial = modelMaterial("#fffaf0", { roughness: 0.32, metalness: 0.03, side: THREE.DoubleSide });
  const glassMaterial = modelMaterial("#3d5a6c", { roughness: 0.2, metalness: 0.2, side: THREE.DoubleSide });
  const podium = modelMaterial("#d9c8a2", { roughness: 0.8 });

  addBox(group, [3.4, 0.14, 2.5], "#e8d9b6", [0, 0.07, 0.1]);
  addBox(group, [2.9, 0.16, 1.9], podium, [0, 0.22, -0.05]);
  for (let step = 0; step < 3; step += 1) {
    addBox(group, [2.2 - step * 0.2, 0.05, 0.14], "#c9b287", [-0.2, 0.165 + step * 0.045, 1.06 - step * 0.13]);
  }

  // A sail: quarter of a sphere, squeezed narrow, its glazed mouth facing local -z.
  const addShell = (parent: THREE.Object3D, radius: number, z: number, flip = false) => {
    const shell = new THREE.Group();
    shell.position.set(0, 0, z);
    shell.rotation.y = flip ? Math.PI : 0;
    const sail = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 8, 0, Math.PI, 0, Math.PI / 2), shellMaterial);
    sail.scale.set(0.5, 1.28, 0.92);
    shell.add(sail);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.93, 10, 0, Math.PI), glassMaterial);
    glass.scale.set(0.5, 1.28, 1);
    glass.position.z = 0.03;
    shell.add(glass);
    parent.add(shell);
  };
  const addHall = (x: number, z: number, scale: number, yaw: number) => {
    const hall = new THREE.Group();
    hall.position.set(x, 0.3, z);
    hall.rotation.y = yaw;
    hall.scale.setScalar(scale);
    addShell(hall, 1.0, -0.6);
    addShell(hall, 0.8, -0.02);
    addShell(hall, 0.6, 0.46);
    addShell(hall, 0.52, 1.5, true);
    group.add(hall);
  };
  // Mouths open toward the harbour side the camera looks from.
  addHall(-0.1, -0.55, 1, Math.PI - 0.62);
  addHall(0.2, 0.42, 0.84, Math.PI - 0.62);
  // The small restaurant shell out front.
  const restaurant = new THREE.Group();
  restaurant.position.set(-1.12, 0.3, 0.3);
  restaurant.rotation.y = Math.PI - 0.3;
  restaurant.scale.setScalar(0.46);
  addShell(restaurant, 1.0, 0);
  addShell(restaurant, 0.7, 0.9, true);
  group.add(restaurant);

  addBox(group, [3.1, 0.04, 0.08], project.color, [0, 0.16, -1.1]);
  return group;
}

function createBondiModel(project: Project) {
  const group = new THREE.Group();

  // A diorama plinth keeps the coast slice from fighting the city terrain for
  // the same y, the way the harbour model does.
  const TOP = 0.16;
  const level = {
    water: TOP + 0.004,
    deep: TOP + 0.008,
    wet: TOP + 0.018,
    sand: TOP + 0.03,
    grass: TOP + 0.026,
    road: TOP + 0.016,
    block: TOP + 0.012,
    promenade: TOP + 0.046,
    foam: TOP + 0.034,
  };

  const sandMaterial = modelMaterial("#f4e0ad", { roughness: 0.94 });
  const wetSandMaterial = modelMaterial("#d8bd88", { roughness: 0.82 });
  const shallowMaterial = modelMaterial("#4ec3d6", { roughness: 0.18, metalness: 0.06 });
  const deepMaterial = modelMaterial("#1f7d99", { roughness: 0.24, metalness: 0.08 });
  const promenadeMaterial = modelMaterial("#e7ddc3", { roughness: 0.78 });
  const grassMaterial = modelMaterial("#42804a", { roughness: 0.92 });
  const roadMaterial = modelMaterial("#3a3d38", { roughness: 0.86 });
  const blockMaterial = modelMaterial("#4b4e47", { roughness: 0.82 });
  const rockMaterial = modelMaterial("#a8977a", { roughness: 0.96 });
  const darkRockMaterial = modelMaterial("#8a7b62", { roughness: 0.96 });
  const wallMaterial = modelMaterial("#e4d8ba", { roughness: 0.8 });
  const creamMaterial = modelMaterial("#f6ecd2", { roughness: 0.66 });
  const roofMaterial = modelMaterial("#c4653f", { roughness: 0.74 });
  const poolWater = modelMaterial("#3fb6da", { roughness: 0.12, metalness: 0.08 });
  const white = modelMaterial("#fffdf4", { roughness: 0.58 });
  const red = modelMaterial("#e6533f", { roughness: 0.52 });
  const yellow = modelMaterial("#f7d35f", { roughness: 0.52 });
  const pineMaterial = modelMaterial("#2f5d3a", { roughness: 0.9 });
  const trunkMaterial = modelMaterial("#6a4c32", { roughness: 0.88 });
  const skinMaterial = modelMaterial("#e2ab7f", { roughness: 0.82 });
  const darkMaterial = modelMaterial("#1c2322", { roughness: 0.6 });
  const swash = new THREE.MeshBasicMaterial({ color: "#fffdf4", transparent: true, opacity: 0.55 });

  addBox(group, [3.44, TOP, 2.94], "#c8b68b", [-0.25, TOP / 2, 0], [0, 0, 0], { roughness: 0.94 });

  // Bondi is a bay, so the shoreline, promenade, park and parade all bend on
  // the same parabola: x = offset + CURVE * (z / SPAN)^2.
  const CURVE = 0.4;
  const SPAN = 1.45;
  const EDGE = 1.44;
  const OUT = 1.42;
  const curveX = (z: number, offset: number) => offset + CURVE * (z / SPAN) ** 2;
  const curveAngle = (z: number) => Math.atan((2 * CURVE * z) / SPAN ** 2);
  const curveBand = (offset: number, zMin = -EDGE, zMax = EDGE, steps = 20) => {
    const points: MapPoint[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const z = zMin + ((zMax - zMin) * i) / steps;
      points.push({ x: curveX(z, offset), z });
    }
    return points;
  };
  const bandShape = (inner: number, outer: number, zMin = -EDGE, zMax = EDGE) => [
    ...curveBand(inner, zMin, zMax),
    ...curveBand(outer, zMin, zMax).reverse(),
  ];
  const toSea = (offset: number) => [...curveBand(offset), { x: OUT, z: EDGE }, { x: OUT, z: -EDGE }];

  // Ground plan: ocean to the east, Campbell Parade to the west.
  addFlatShape(group, toSea(0.14), shallowMaterial, level.water);
  addFlatShape(group, toSea(0.72), deepMaterial, level.deep);
  addFlatShape(group, bandShape(0.02, 0.26), wetSandMaterial, level.wet);
  addFlatShape(group, bandShape(-0.7, 0.06), sandMaterial, level.sand);
  addFlatShape(group, bandShape(-0.86, -0.7), promenadeMaterial, level.promenade);
  addFlatShape(group, bandShape(-1.4, -0.86), grassMaterial, level.grass);
  addFlatShape(group, bandShape(-1.7, -1.42), roadMaterial, level.road);
  addFlatShape(group, [{ x: -1.94, z: -EDGE }, ...curveBand(-1.7), { x: -1.94, z: EDGE }], blockMaterial, level.block);

  // Swash line where the water runs up the sand.
  addFlatShape(group, bandShape(0.03, 0.09), swash, level.foam - 0.002);

  // Sets rolling in: foam lines that travel shoreward and fade as they break.
  const foamLines = [0.34, 0.62, 0.94].map((offset, index) => {
    const material = new THREE.MeshBasicMaterial({ color: "#fffdf4", transparent: true, opacity: 0.5 });
    const mesh = addFlatShape(group, bandShape(offset, offset + 0.045), material, level.foam);
    return { material, mesh, phase: index / 3 };
  });

  // Sandstone shelves at each end: Ben Buckler north, Mackenzies Point south.
  const addRock = (
    x: number,
    z: number,
    width: number,
    depth: number,
    height: number,
    material: THREE.Material,
  ) => {
    addBox(group, [width, height, depth], material, [x, TOP + height / 2, z], [0, curveAngle(z) * 0.6 + x, 0]);
  };
  const shelfChunks: Array<[number, number, number, number, number]> = [
    [0.32, 0.0, 0.44, 0.32, 0.045],
    [0.62, 0.09, 0.42, 0.28, 0.075],
    [0.88, 0.02, 0.34, 0.3, 0.105],
    [0.7, 0.21, 0.3, 0.2, 0.125],
    [1.14, 0.08, 0.22, 0.18, 0.055],
  ];
  const addShelf = (baseZ: number, direction: number) => {
    shelfChunks.forEach(([x, dz, width, depth, height], index) => {
      addRock(
        x,
        baseZ + direction * dz,
        width,
        depth,
        height,
        index % 2 ? rockMaterial : darkRockMaterial,
      );
    });
  };
  addShelf(1.08, 1);
  addShelf(-1.06, -1);

  // Bondi Icebergs: the lap pool cut into the southern rock shelf.
  const icebergs = new THREE.Group();
  icebergs.position.set(0.72, TOP + 0.075, 1.0);
  icebergs.rotation.y = -0.2;
  addBox(icebergs, [0.46, 0.04, 0.62], white, [0, 0.02, 0]);
  addBox(icebergs, [0.34, 0.035, 0.5], poolWater, [0.01, 0.032, 0], [0, 0, 0], { roughness: 0.12 });
  [-0.1, 0.01, 0.12].forEach((x) => {
    addBox(icebergs, [0.008, 0.006, 0.48], white, [x, 0.05, 0]);
  });
  addBox(icebergs, [0.18, 0.03, 0.14], poolWater, [0.0, 0.03, -0.36], [0, 0, 0], { roughness: 0.12 });
  addBox(icebergs, [0.06, 0.08, 0.64], creamMaterial, [-0.24, 0.05, 0]);
  addBox(icebergs, [0.22, 0.11, 0.28], creamMaterial, [-0.34, 0.06, -0.34]);
  addBox(icebergs, [0.26, 0.025, 0.32], red, [-0.34, 0.13, -0.34]);
  group.add(icebergs);

  // Bondi Pavilion: cream block, terracotta roof, arched colonnade.
  const pavilion = new THREE.Group();
  pavilion.position.set(curveX(0.04, -1.08), TOP + 0.024, 0.04);
  addBox(pavilion, [0.38, 0.26, 1.05], creamMaterial, [0, 0.13, 0]);
  addBox(pavilion, [0.46, 0.04, 1.13], roofMaterial, [0, 0.28, 0]);
  addBox(pavilion, [0.28, 0.12, 0.32], creamMaterial, [0, 0.36, 0]);
  addBox(pavilion, [0.34, 0.03, 0.38], roofMaterial, [0, 0.435, 0]);
  addCylinder(pavilion, 0.07, 0.085, 0.09, creamMaterial, [0, 0.49, 0], [0, 0, 0], 16);
  addSphere(pavilion, 0.07, roofMaterial, [0, 0.545, 0], 16).scale.set(1, 0.68, 1);
  addBox(pavilion, [0.04, 0.14, 1.0], darkMaterial, [0.18, 0.13, 0]);
  for (let i = 0; i < 6; i += 1) {
    addCylinder(pavilion, 0.022, 0.022, 0.2, creamMaterial, [0.21, 0.1, -0.4 + i * 0.16], [0, 0, 0], 8);
  }
  addBox(pavilion, [0.05, 0.04, 1.05], creamMaterial, [0.21, 0.22, 0]);
  addBox(pavilion, [0.4, 0.025, 0.08], project.color, [0, 0.285, -0.54]);
  group.add(pavilion);

  // North Bondi surf life saving club.
  const surfClub = new THREE.Group();
  surfClub.position.set(curveX(-1.1, -1.06), TOP + 0.024, -1.1);
  surfClub.rotation.y = 0.34;
  addBox(surfClub, [0.32, 0.18, 0.44], white, [0, 0.09, 0]);
  addBox(surfClub, [0.38, 0.03, 0.5], red, [0, 0.195, 0]);
  addBox(surfClub, [0.22, 0.08, 0.34], white, [0, 0.25, 0]);
  addBox(surfClub, [0.26, 0.025, 0.4], red, [0, 0.3, 0]);
  addBox(surfClub, [0.05, 0.07, 0.3], darkMaterial, [0.17, 0.12, 0]);
  addCylinder(surfClub, 0.01, 0.01, 0.32, white, [-0.14, 0.32, 0.18], [0, 0, 0], 8);
  addBox(surfClub, [0.015, 0.08, 0.12], yellow, [-0.14, 0.44, 0.24]);
  group.add(surfClub);

  // Campbell Parade shopfronts across the road.
  ([
    [-0.62, 0.24, "#e8dcc0"],
    [-0.04, 0.28, "#dfcfae"],
    [0.54, 0.22, "#eadfc4"],
  ] as const).forEach(([z, height, colour], index) => {
    const x = curveX(z, -1.82);
    addBox(group, [0.22, height, 0.42], colour, [x, TOP + height / 2, z], [0, curveAngle(z), 0]);
    addBox(group, [0.26, 0.03, 0.46], index % 2 ? red : project.color, [x, TOP + height + 0.015, z], [0, curveAngle(z), 0]);
    addBox(group, [0.015, 0.08, 0.3], "#94d8e8", [x + 0.12, TOP + height * 0.55, z], [0, curveAngle(z), 0]);
  });

  // Norfolk Island pines along the park.
  ([-0.98, -0.5, 0.0, 0.52, 1.0] as const).forEach((z, index) => {
    const x = curveX(z, -1.3) + (index % 2) * 0.05;
    addCylinder(group, 0.018, 0.024, 0.22, trunkMaterial, [x, TOP + 0.11, z], [0, 0, 0], 6);
    addCone(group, 0.14, 0.3, 10, pineMaterial, [x, TOP + 0.32, z]);
    addCone(group, 0.095, 0.28, 10, pineMaterial, [x, TOP + 0.54, z]);
  });

  // Sea wall between promenade and sand, with a run of graffiti panels.
  const graffiti = ["#e6533f", "#f7d35f", "#22d66f", "#2f8ec7", "#d87ad0"];
  const wallEnd = EDGE - 0.16;
  for (let i = 0; i < 10; i += 1) {
    const z = -wallEnd + (i * (wallEnd * 2)) / 9;
    const x = curveX(z, -0.71);
    addBox(group, [0.04, 0.08, 0.32], wallMaterial, [x, TOP + 0.04, z], [0, curveAngle(z), 0]);
    if (i % 3 === 1) {
      addBox(group, [0.01, 0.05, 0.22], graffiti[i % graffiti.length], [x + 0.025, TOP + 0.04, z], [0, curveAngle(z), 0]);
    }
  }
  // Steps down to the sand at two breaks in the wall.
  [-0.5, 0.64].forEach((z) => {
    for (let step = 0; step < 3; step += 1) {
      addBox(
        group,
        [0.05, 0.025, 0.22],
        promenadeMaterial,
        [curveX(z, -0.69) + step * 0.045, TOP + 0.06 - step * 0.018, z],
        [0, curveAngle(z), 0],
      );
    }
  });

  // The skate bowl at the south end of the park.
  const bowlZ = 1.1;
  const bowlX = curveX(bowlZ, -1.06);
  addCylinder(group, 0.19, 0.19, 0.025, "#9a9c93", [bowlX, TOP + 0.035, bowlZ], [0, 0, 0], 26);
  addCylinder(group, 0.14, 0.13, 0.025, "#7d8078", [bowlX, TOP + 0.043, bowlZ], [0, 0, 0], 26);

  // Lifeguard tower on the sand.
  const tower = new THREE.Group();
  tower.position.set(curveX(-0.42, -0.48), TOP + 0.028, -0.42);
  tower.rotation.y = 0.24;
  ([[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]] as const).forEach(([x, z]) => {
    addCylinder(tower, 0.012, 0.012, 0.18, darkMaterial, [x, 0.09, z], [0, 0, 0], 6);
  });
  addBox(tower, [0.22, 0.13, 0.2], creamMaterial, [0, 0.245, 0]);
  addBox(tower, [0.23, 0.05, 0.21], yellow, [0.005, 0.3, 0]);
  addBox(tower, [0.015, 0.07, 0.15], "#94d8e8", [0.11, 0.25, 0]);
  addBox(tower, [0.24, 0.018, 0.04], red, [0, 0.335, 0]);
  addCylinder(tower, 0.007, 0.007, 0.16, darkMaterial, [-0.09, 0.4, 0.08], [0, 0, 0], 6);
  group.add(tower);

  // Red-and-yellow patrol flags marking the swim zone.
  const flags: THREE.Mesh[] = [];
  ([-0.6, 0.38] as const).forEach((z) => {
    const x = curveX(z, -0.12);
    addCylinder(group, 0.008, 0.008, 0.24, darkMaterial, [x, TOP + 0.15, z], [0, 0, 0], 8);
    const flagAngle = curveAngle(z) + 0.4;
    flags.push(addBox(group, [0.012, 0.055, 0.13], red, [x + 0.025, TOP + 0.25, z + 0.05], [0, flagAngle, 0]));
    flags.push(addBox(group, [0.012, 0.055, 0.13], yellow, [x + 0.025, TOP + 0.195, z + 0.05], [0, flagAngle, 0]));
  });

  // Umbrellas, towels and boards on the dry sand.
  ([
    [-0.56, -0.88, "#e6533f"],
    [-0.42, -0.12, "#f7d35f"],
    [-0.52, 0.56, "#2f8ec7"],
    [-0.36, 1.0, "#22d66f"],
  ] as const).forEach(([offset, z, colour], index) => {
    const x = curveX(z, offset);
    addCylinder(group, 0.007, 0.007, 0.16, "#efe6cf", [x, TOP + 0.11, z], [0, 0, 0], 6);
    addCone(group, 0.13, 0.08, 12, colour, [x, TOP + 0.22, z], [Math.PI, index * 0.5, 0]);
  });
  ([
    [-0.62, -0.7, "#f2f0e4"],
    [-0.46, -0.34, "#e6533f"],
    [-0.58, 0.28, "#2f8ec7"],
    [-0.44, 1.1, "#d87ad0"],
  ] as const).forEach(([offset, z, colour]) => {
    const x = curveX(z, offset);
    addBox(group, [0.13, 0.007, 0.19], colour, [x, TOP + 0.033, z], [0, curveAngle(z) + 0.3, 0]);
  });
  const boardColours = ["#fff4bd", "#e6533f", "#2f8ec7", "#22d66f"];
  ([-0.68, -0.02, 0.66] as const).forEach((z, index) => {
    const x = curveX(z, -0.26);
    addBox(group, [0.085, 0.015, 0.36], boardColours[index], [x, TOP + 0.038, z], [0, curveAngle(z) + 0.5 - index * 0.3, 0], {
      roughness: 0.5,
    });
  });
  // A couple of boards stood up in the sand.
  ([[-0.64, -0.24], [-0.66, 0.86]] as const).forEach(([offset, z], index) => {
    const x = curveX(z, offset);
    addBox(group, [0.07, 0.28, 0.018], boardColours[index + 1], [x, TOP + 0.16, z], [0, 0.5, index ? 0.18 : -0.16], {
      roughness: 0.5,
    });
  });

  // People: a couple on the sand, a couple in the shallows.
  const addPerson = (x: number, z: number, colour: string, height = 0.12) => {
    addCylinder(group, 0.021, 0.025, height, colour, [x, TOP + 0.028 + height / 2, z], [0, 0, 0], 6);
    addSphere(group, 0.026, skinMaterial, [x, TOP + 0.04 + height, z], 8);
  };
  ([
    [-0.46, -0.54, "#e6533f"],
    [-0.32, 0.08, "#f2f0e4"],
    [-0.24, 0.9, "#f7d35f"],
  ] as const).forEach(([offset, z, colour]) => {
    addPerson(curveX(z, offset), z, colour);
  });
  addPerson(curveX(-0.3, 0.14), -0.3, "#f2f0e4", 0.08);

  const surfer = new THREE.Group();
  surfer.position.set(curveX(0.7, 0.5), TOP + 0.028, 0.7);
  surfer.rotation.y = curveAngle(0.7) + 0.6;
  addBox(surfer, [0.08, 0.013, 0.34], "#fff4bd", [0, 0.01, 0], [0, 0, 0], { roughness: 0.5 });
  addCylinder(surfer, 0.019, 0.023, 0.1, "#151713", [0, 0.065, 0], [0.1, 0, 0], 8);
  addSphere(surfer, 0.022, skinMaterial, [0, 0.13, 0.01], 10);
  group.add(surfer);

  group.userData.tick = (time: number) => {
    foamLines.forEach(({ material, mesh, phase }) => {
      const progress = (time * 0.16 + phase) % 1;
      mesh.position.x = -progress * 0.78;
      material.opacity = 0.55 * Math.sin(progress * Math.PI) ** 0.7;
    });
    flags.forEach((flag, index) => {
      flag.rotation.y = curveAngle(flag.position.z) + 0.4 + Math.sin(time * 1.6 + index) * 0.12;
    });
    surfer.position.y = TOP + 0.028 + Math.sin(time * 1.9) * 0.007;
  };

  return group;
}

function createDoverHomeModel(project: Project) {
  const group = new THREE.Group();
  const wall = modelMaterial("#fffaf0", { roughness: 0.7 });
  const roof = modelMaterial("#c4653f", { roughness: 0.7 });
  const glass = new THREE.MeshBasicMaterial({ color: "#9fd8ef" });
  const hedge = modelMaterial("#3f7f45", { roughness: 0.9 });

  // Lawn, driveway and path.
  addBox(group, [3.0, 0.1, 2.3], "#5c9a57", [0, 0.05, 0], [0, 0, 0], { roughness: 0.94 });
  addBox(group, [0.8, 0.02, 0.9], "#cfc8b0", [-0.92, 0.11, 0.7]);
  addBox(group, [0.3, 0.02, 0.86], "#e7ddc3", [0.18, 0.11, 0.72]);

  // Two-storey house with a gabled roof, front to the camera.
  addBox(group, [1.5, 0.62, 1.05], wall, [0.2, 0.41, -0.28]);
  addBox(group, [1.2, 0.5, 0.95], wall, [0.3, 0.97, -0.3]);
  addPrism(group, [1.44, 0.46, 1.1], roof, [0.3, 1.22, -0.3], Math.PI / 2);
  addBox(group, [0.16, 0.36, 0.16], "#b3a68c", [0.66, 1.5, -0.5]);
  addBox(group, [0.24, 0.42, 0.05], "#7a4a2b", [0.18, 0.31, 0.26]);
  addBox(group, [0.36, 0.26, 0.05], glass, [0.64, 0.46, 0.26]);
  addBox(group, [0.36, 0.26, 0.05], glass, [-0.26, 0.46, 0.26]);
  [-0.02, 0.62].forEach((x) => addBox(group, [0.3, 0.24, 0.05], glass, [x, 1.0, 0.19]));
  addBox(group, [1.3, 0.05, 0.2], "#d9d0bc", [0.3, 0.74, 0.28]);

  // Garage wing.
  addBox(group, [0.86, 0.54, 0.9], wall, [-0.94, 0.37, -0.3]);
  addBox(group, [0.94, 0.08, 0.98], "#d9d0bc", [-0.94, 0.68, -0.3]);
  addBox(group, [0.62, 0.4, 0.05], "#8f9b9c", [-0.94, 0.3, 0.16]);

  // Pool out the front, hedge along the side, a tree.
  addBox(group, [0.9, 0.06, 0.56], "#fffdf4", [0.92, 0.13, 0.74]);
  addBox(group, [0.78, 0.04, 0.44], "#3fb6da", [0.92, 0.16, 0.74], [0, 0, 0], { roughness: 0.12, metalness: 0.08 });
  addBox(group, [0.14, 0.2, 1.9], hedge, [1.4, 0.2, -0.05]);
  addCylinder(group, 0.04, 0.06, 0.4, "#6a4c32", [-1.28, 0.3, -0.86], [0, 0, 0], 8);
  addSphere(group, 0.3, hedge, [-1.28, 0.7, -0.86], 12);

  // The pin that says "home".
  const pin = new THREE.Group();
  pin.position.set(0.3, 2.1, -0.3);
  const gold = modelMaterial(project.color, { roughness: 0.36, metalness: 0.2, emissive: "#6a4a10", emissiveIntensity: 0.25 });
  addSphere(pin, 0.26, gold, [0, 0.3, 0], 18);
  addCone(pin, 0.2, 0.42, 16, gold, [0, 0, 0], [Math.PI, 0, 0]);
  addSphere(pin, 0.1, "#fffdf4", [0, 0.32, 0.2], 10);
  group.add(pin);
  group.userData.tick = (time: number) => {
    pin.position.y = 2.1 + Math.sin(time * 2.2) * 0.08;
    pin.rotation.y = time * 0.8;
  };
  return group;
}

/** Push a polygon's outline outward by `distance` (mitred), whatever its winding. */
function offsetPolygon(points: MapPoint[], distance: number): MapPoint[] {
  let area = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    area += point.x * next.z - next.x * point.z;
  });
  const sign = area > 0 ? 1 : -1;
  return points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const normal = (from: MapPoint, to: MapPoint) => {
      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const length = Math.hypot(dx, dz) || 1;
      return { x: (sign * dz) / length, z: (-sign * dx) / length };
    };
    const a = normal(previous, point);
    const b = normal(point, next);
    const mx = a.x + b.x;
    const mz = a.z + b.z;
    const length = Math.hypot(mx, mz) || 1;
    const miter = distance / Math.max(0.45, (mx / length) * a.x + (mz / length) * a.z);
    return { x: point.x + (mx / length) * miter, z: point.z + (mz / length) * miter };
  });
}

/** Small deterministic PRNG so scattered scenery is identical on every load. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanceToSegment(point: MapPoint, start: MapPoint, end: MapPoint) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSq = dx * dx + dz * dz || 1;
  const t = THREE.MathUtils.clamp(((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSq, 0, 1);
  return Math.hypot(point.x - (start.x + dx * t), point.z - (start.z + dz * t));
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
    // The shadow frustum is re-centred on the walker every frame, so shadows
    // exist wherever the camera is rather than only near the map origin.
    sun.shadow.camera.left = -24;
    sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24;
    sun.shadow.camera.bottom = -24;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);
    scene.add(sun.target);

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
      { x: sydneyPlaces.harbourBridge.x + 5.35, z: sydneyPlaces.harbourBridge.z + 0.5 },
      { x: sydneyPlaces.harbourBridge.x + 2.1, z: sydneyPlaces.harbourBridge.z - 0.25 },
      { x: sydneyPlaces.harbourBridge.x - 2.55, z: sydneyPlaces.harbourBridge.z - 0.4 },
      { x: sydneyPlaces.milsonsPoint.x - 5.75, z: sydneyPlaces.milsonsPoint.z + 1.0 },
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
    // Sand behind the Bondi stop, running back up to Campbell Parade. The stop
    // itself carries the beach, so this only has to blend it into the land and
    // give the walker somewhere to arrive.
    const bondiSandShape = [
      { x: cityProjectPlots.bondiBeach.x - 1.98, z: cityProjectPlots.bondiBeach.z + 1.13 },
      { x: cityProjectPlots.bondiBeach.x + 1.13, z: cityProjectPlots.bondiBeach.z - 1.98 },
      { x: cityProjectPlots.bondiBeach.x - 1.27, z: cityProjectPlots.bondiBeach.z - 3.82 },
      { x: cityProjectPlots.bondiBeach.x - 3.82, z: cityProjectPlots.bondiBeach.z - 1.27 },
    ];
    const operaPromenadeShape = [
      { x: sydneyPlaces.operaHouse.x - 3.45, z: sydneyPlaces.operaHouse.z + 1.2 },
      { x: sydneyPlaces.operaHouse.x + 3.55, z: sydneyPlaces.operaHouse.z + 1.3 },
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
      { x: sydneyPlaces.milsonsPoint.x - 3.65, z: sydneyPlaces.milsonsPoint.z + 0.05 },
      { x: sydneyPlaces.milsonsPoint.x + 3.45, z: sydneyPlaces.milsonsPoint.z + 0.15 },
      { x: sydneyPlaces.kirribilli.x + 3.25, z: sydneyPlaces.kirribilli.z + 1.5 },
      { x: sydneyPlaces.milsonsPoint.x - 3.45, z: sydneyPlaces.milsonsPoint.z + 1.6 },
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
      return plotPolygon(project, isFlagship ? 5.15 : isLandmark ? 3.2 : 4.3, isFlagship ? 4.15 : isLandmark ? 2.7 : 3.55);
    });
    // The crossing itself: deck plus both ramps as one continuous walkable
    // strip, matching exactly what harbourBridgeSurface() raises the ball onto.
    const bridgeAxisX = HARBOUR_BRIDGE.north.x - HARBOUR_BRIDGE.south.x;
    const bridgeAxisZ = HARBOUR_BRIDGE.north.z - HARBOUR_BRIDGE.south.z;
    const bridgeSpan = Math.hypot(bridgeAxisX, bridgeAxisZ);
    const bridgeUx = bridgeAxisX / bridgeSpan;
    const bridgeUz = bridgeAxisZ / bridgeSpan;
    const harbourCrossingShape = pathPolygon(
      {
        x: HARBOUR_BRIDGE.south.x - bridgeUx * HARBOUR_BRIDGE.rampLength,
        z: HARBOUR_BRIDGE.south.z - bridgeUz * HARBOUR_BRIDGE.rampLength,
      },
      {
        x: HARBOUR_BRIDGE.north.x + bridgeUx * HARBOUR_BRIDGE.rampLength,
        z: HARBOUR_BRIDGE.north.z + bridgeUz * HARBOUR_BRIDGE.rampLength,
      },
      HARBOUR_BRIDGE.deckWidth,
    );
    const walkableAreas = [
      mainLandShape,
      inlandSuburbsShape,
      northShoreShape,
      harbourCrossingShape,
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

    // Water plane slightly lower than sand base to avoid z-fighting; we'll animate its material UVs
    const waterY = -0.12;
    addPlane(180, 150, 9, -5, waterMaterial, waterY);
    // Shoreline: every landmass gets a sand rim and two bands of shallows beneath
    // it, so the coast reads as a coast instead of a hard edge on flat blue.
    const landmasses = [mainLandShape, inlandSuburbsShape, northShoreShape, northArchiveHeadlandShape, kirribilliHeadlandShape];
    const shallowsMaterial = new THREE.MeshBasicMaterial({ color: "#4fc3cf", transparent: true, opacity: 0.34, depthWrite: false });
    const reefMaterial = new THREE.MeshBasicMaterial({ color: "#7fe0dc", transparent: true, opacity: 0.42, depthWrite: false });
    const shoreSandMaterial = new THREE.MeshStandardMaterial({ color: "#ead9a4", map: sand, roughness: 0.9 });
    landmasses.forEach((shape) => {
      addFlatShape(groundGroup, offsetPolygon(shape, 1.5), shallowsMaterial, -0.085);
      addFlatShape(groundGroup, offsetPolygon(shape, 0.7), reefMaterial, -0.06);
      addFlatShape(groundGroup, offsetPolygon(shape, 0.24), shoreSandMaterial, -0.03);
    });
    addFlatShape(groundGroup, mainLandShape, parkMaterial);
    addFlatShape(groundGroup, inlandSuburbsShape, inlandMaterial, 0.018);
    addFlatShape(groundGroup, harbourWaterShape, harbourMaterial, -0.1);
    addFlatShape(groundGroup, northShoreShape, scrubMaterial, 0.026);
    addFlatShape(groundGroup, northArchiveHeadlandShape, scrubMaterial, 0.027);
    addFlatShape(groundGroup, lavenderBayShape, scrubMaterial, 0.03);
    addFlatShape(groundGroup, kirribilliHeadlandShape, scrubMaterial, 0.031);
    addFlatShape(groundGroup, northSydneyDistrictShape, districtMaterial, 0.049);
    addFlatShape(groundGroup, milsonsPromenadeShape, promenadeMaterial, 0.055);
    // No painted causeway: the crossing is the 3D deck, so the water below it
    // stays open water.
    // The Bondi stop carries its own beach, so this polygon is only the strip of
    // sand the diorama sits on (and the walkable area that reaches it).
    addFlatShape(groundGroup, bondiSandShape, sandMaterial, 0.02);
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

    // Woodland: a few hundred instanced trees scattered over open ground, kept
    // clear of stops, roads, districts and water. Three draw calls in total.
    {
      const random = seededRandom(20261110);
      const districtCentres = [sydneyPlaces.cbd, sydneyPlaces.blackbird, sydneyPlaces.eveleigh, sydneyPlaces.bondiJunction];
      const builtShapes = [
        graveyardShape,
        learningCentreShape,
        northSydneyDistrictShape,
        milsonsPromenadeShape,
        operaPromenadeShape,
        bondiSandShape,
        harbourCrossingShape,
        offsetPolygon(harbourWaterShape, 0.5),
      ];
      const pitchCentre = nudgePoint(sydneyPlaces.sportsField, 0.45, 0.3);
      const isOpenGround = (point: MapPoint) => {
        if (!landmasses.some((shape) => pointInPolygon(point, offsetPolygon(shape, -0.55)))) return false;
        if (builtShapes.some((shape) => pointInPolygon(point, shape))) return false;
        if (mapItems.some((item) => Math.hypot(point.x - item.x, point.z - item.z) < (item.mapKind ? 1.6 : 3.7))) return false;
        if (districtCentres.some((centre) => Math.abs(point.x - centre.x) < 4.9 && Math.abs(point.z - centre.z) < 3.9)) return false;
        if (cityRoutes.some((route) => distanceToSegment(point, route.start, route.end) < 1.05)) return false;
        if (Math.hypot((point.x - pitchCentre.x) / 1.55, (point.z - pitchCentre.z) / 0.92) < 2.7) return false;
        if (Math.hypot(point.x - sydneyPlaces.queensPark.x, point.z - sydneyPlaces.queensPark.z) < 3.4) return false;
        if (Math.hypot(point.x - sydneyPlaces.doverHeights.x, point.z - sydneyPlaces.doverHeights.z) < 3.3) return false;
        // North Sydney towers and the suburb rows behind them.
        if (
          point.x > sydneyPlaces.northSydney.x - 7.4 && point.x < sydneyPlaces.northSydney.x + 5.6 &&
          point.z > sydneyPlaces.northSydney.z - 5.6 && point.z < sydneyPlaces.northSydney.z + 2.6
        ) return false;
        return true;
      };

      // Groves: pick seed points, then cluster a handful of trees round each.
      const spots: Array<{ x: number; z: number; scale: number; kind: number }> = [];
      for (let attempt = 0; attempt < 520 && spots.length < 300; attempt += 1) {
        const centre = { x: -22 + random() * 54, z: -24 + random() * 48 };
        if (!isOpenGround(centre)) continue;
        const kind = random() < 0.45 ? 0 : 1;
        const count = 2 + Math.floor(random() * 5);
        for (let i = 0; i < count; i += 1) {
          const angle = random() * Math.PI * 2;
          const reach = random() * 1.5;
          const point = { x: centre.x + Math.cos(angle) * reach, z: centre.z + Math.sin(angle) * reach };
          if (!isOpenGround(point)) continue;
          if (spots.some((spot) => Math.hypot(spot.x - point.x, spot.z - point.z) < 0.5)) continue;
          spots.push({ ...point, scale: 0.7 + random() * 0.6, kind: random() < 0.8 ? kind : 1 - kind });
        }
      }

      const trunkGeometry = new THREE.CylinderGeometry(0.045, 0.065, 0.4, 6);
      const coniferGeometry = new THREE.ConeGeometry(0.3, 0.78, 7);
      const canopyGeometry = new THREE.IcosahedronGeometry(0.34, 0);
      const trunks = new THREE.InstancedMesh(trunkGeometry, new THREE.MeshStandardMaterial({ color: "#6b5137", roughness: 0.85 }), spots.length);
      const conifers = spots.filter((spot) => spot.kind === 0);
      const broadleaf = spots.filter((spot) => spot.kind === 1);
      const coniferMesh = new THREE.InstancedMesh(coniferGeometry, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, flatShading: true }), Math.max(1, conifers.length));
      const canopyMesh = new THREE.InstancedMesh(canopyGeometry, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, flatShading: true }), Math.max(1, broadleaf.length));
      coniferMesh.count = conifers.length;
      canopyMesh.count = broadleaf.length;
      const dummy = new THREE.Object3D();
      const tint = new THREE.Color();
      spots.forEach((spot, index) => {
        dummy.position.set(spot.x, 0.2 * spot.scale, spot.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(spot.scale);
        dummy.updateMatrix();
        trunks.setMatrixAt(index, dummy.matrix);
      });
      conifers.forEach((spot, index) => {
        dummy.position.set(spot.x, 0.72 * spot.scale, spot.z);
        dummy.rotation.set(0, random() * Math.PI, 0);
        dummy.scale.setScalar(spot.scale);
        dummy.updateMatrix();
        coniferMesh.setMatrixAt(index, dummy.matrix);
        coniferMesh.setColorAt(index, tint.setHSL(0.38 + random() * 0.04, 0.48, 0.24 + random() * 0.07));
      });
      broadleaf.forEach((spot, index) => {
        dummy.position.set(spot.x, 0.6 * spot.scale, spot.z);
        dummy.rotation.set(random(), random() * Math.PI, random());
        dummy.scale.set(spot.scale, spot.scale * (0.85 + random() * 0.3), spot.scale);
        dummy.updateMatrix();
        canopyMesh.setMatrixAt(index, dummy.matrix);
        canopyMesh.setColorAt(index, tint.setHSL(0.27 + random() * 0.07, 0.5, 0.3 + random() * 0.1));
      });
      [trunks, coniferMesh, canopyMesh].forEach((mesh) => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      });
    }

    const colliders: THREE.Object3D[] = [];
    const placards: THREE.Group[] = [];
    // Models can expose userData.tick to animate themselves each frame.
    const modelTicks: Array<(time: number) => void> = [];
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
      model.rotation.y = project.heading ?? 0;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          object.userData.projectId = project.id;
          colliders.push(object);
        }
      });
      group.add(model);
      if (typeof model.userData.tick === "function") {
        modelTicks.push(model.userData.tick as (time: number) => void);
      }

      const imageTexture = addTexture(loader.load(projectImageSrc(project), (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }));

      const stopRadius = isArchiveZoneItem ? 0.72 : project.tier === "flagship" ? 1.35 : 1.25;

      // One placard per stop: screenshot over name board, standing on the side
      // the camera looks from so the model never hides it.
      const cardScale = isArchiveZoneItem ? 0.36 : project.tier === "flagship" ? 0.85 : 0.72;
      const imageWidth = 2.3 * cardScale;
      const imageHeight = imageWidth / 1.7;
      const labelWidth = imageWidth;
      const labelBoardHeight = labelWidth / 3;
      const frameInset = 0.05 * cardScale;

      const placard = new THREE.Group();
      const postHeight = 0.26 * cardScale;
      const frame = addBox(
        placard,
        [imageWidth + frameInset * 2, imageHeight + labelBoardHeight + frameInset * 3, 0.045],
        "#fffdf4",
        [0, postHeight + (imageHeight + labelBoardHeight + frameInset * 3) / 2, 0],
        [0, 0, 0],
        { roughness: 0.66 },
      );
      frame.userData.projectId = project.id;
      colliders.push(frame);

      const cardBottom = postHeight + frameInset;
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(labelWidth, labelBoardHeight),
        new THREE.MeshBasicMaterial({ map: addTexture(labelTexture(project)), transparent: true }),
      );
      label.position.set(0, cardBottom + labelBoardHeight / 2, 0.03);
      label.userData.projectId = project.id;
      placard.add(label);
      colliders.push(label);

      const imageDecal = new THREE.Mesh(
        new THREE.PlaneGeometry(imageWidth, imageHeight),
        new THREE.MeshBasicMaterial({ map: imageTexture }),
      );
      imageDecal.position.set(0, cardBottom + labelBoardHeight + frameInset + imageHeight / 2, 0.03);
      imageDecal.userData.projectId = project.id;
      placard.add(imageDecal);
      colliders.push(imageDecal);

      [-1, 1].forEach((side) => {
        addBox(
          placard,
          [0.06 * cardScale, postHeight + 0.08, 0.06 * cardScale],
          "#5d6157",
          [side * (imageWidth / 2 - 0.12 * cardScale), (postHeight + 0.08) / 2, 0],
        );
      });

      // Stand it just outside the stop ring, off to the near side of the plot.
      const yaw = cameraYaw(CAMERA_VIEWS.wide);
      const forward = { x: Math.sin(yaw), z: Math.cos(yaw) };
      const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
      // Sit it beside the plot rather than square in front, so low models are
      // not hidden behind their own card.
      const forwardDistance = stopRadius + (isArchiveZoneItem ? 0.22 : 0.34);
      const lateralDistance = isArchiveZoneItem ? 0.08 : stopRadius * 0.95;
      placard.position.set(
        forward.x * forwardDistance + right.x * lateralDistance,
        0.07,
        forward.z * forwardDistance + right.z * lateralDistance,
      );
      placard.rotation.set(PLAQUE_TILT, yaw, 0);
      group.add(placard);
      placards.push(placard);
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
    let requestJump = false;
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
      if ((key === " " || key === "spacebar") && !isEditableTarget(event.target)) {
        event.preventDefault();
        requestJump = true;
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
    // Vertical state: the ball rides the bridge deck and can hop with space.
    let jumpOffset = 0;
    let jumpVelocity = 0;
    let placardView: (typeof CAMERA_VIEWS)[keyof typeof CAMERA_VIEWS] = CAMERA_VIEWS.wide;

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
          player.position.set(nextX, player.position.y, nextZ);
        } else if (segmentInWalkableAreas(previousMapPoint, nextXMapPoint, walkableAreas, PLAYER_BALL_RADIUS)) {
          player.position.set(nextX, player.position.y, previousPosition.z);
        } else if (segmentInWalkableAreas(previousMapPoint, nextZMapPoint, walkableAreas, PLAYER_BALL_RADIUS)) {
          player.position.set(previousPosition.x, player.position.y, nextZ);
        } else {
          player.position.copy(previousPosition);
        }
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
        const moved = player.position.clone().sub(previousPosition);
        const travel = Math.hypot(moved.x, moved.z);
        if (travel > 0.0001) {
          const rollAxis = new THREE.Vector3(moved.z, 0, -moved.x).normalize();
          player.rotateOnWorldAxis(rollAxis, travel / PLAYER_BALL_RADIUS);
        }
      }

      // Settle onto whatever surface is underfoot, then apply the hop.
      const groundY = surfaceHeightAt(player.position.x, player.position.z) + PLAYER_BALL_RADIUS;
      if (requestJump) {
        requestJump = false;
        if (jumpOffset <= 0.001) jumpVelocity = JUMP_SPEED;
      }
      if (jumpOffset > 0 || jumpVelocity > 0) {
        jumpVelocity -= GRAVITY * delta;
        jumpOffset += jumpVelocity * delta;
        if (jumpOffset <= 0) {
          jumpOffset = 0;
          jumpVelocity = 0;
        }
      }
      player.position.y = groundY + jumpOffset;

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

      const view = camera.aspect < 0.75 ? CAMERA_VIEWS.narrow : CAMERA_VIEWS.wide;
      sun.position.set(player.position.x - 10, 18, player.position.z + 12);
      sun.target.position.set(player.position.x, 0, player.position.z);

      // Lift the camera with the deck so crossing the bridge doesn't push the
      // ball up out of frame, but ignore the hop itself.
      const cameraLift = groundY - PLAYER_BALL_RADIUS;
      const cameraTarget = new THREE.Vector3(
        player.position.x + view.offset.x,
        view.offset.y + cameraLift,
        player.position.z + view.offset.z,
      );
      camera.position.lerp(cameraTarget, 0.095);
      camera.lookAt(
        player.position.x + view.look.x,
        view.look.y + cameraLift,
        player.position.z + view.look.z,
      );

      // Placards are built for the wide bearing; on a narrow viewport the camera
      // sits at a slightly different angle, so nudge them once when it changes.
      if (view !== placardView) {
        placardView = view;
        const yaw = cameraYaw(view);
        placards.forEach((placard) => placard.rotation.set(PLAQUE_TILT, yaw, 0));
      }

      if (water && water.offset) {
        // scroll texture slowly
        water.offset.x += delta * 0.02;
        water.offset.y += delta * 0.01;
      }

      // Let self-animating models (Bondi surf, flags) advance.
      modelTicks.forEach((tick) => tick(now / 1000));

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

const plotPoints = new Set<MapPoint>(Object.values(cityProjectPlots));

function trimTowards(start: MapPoint, end: MapPoint, distance: number): MapPoint {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  if (length <= distance + 0.2) return end;
  const scale = (length - distance) / length;
  return { x: start.x + dx * scale, z: start.z + dz * scale };
}

function addCityPaths(scene: THREE.Scene) {
  const roadMaterial = new THREE.MeshStandardMaterial({ color: "#e7d093", roughness: 0.86 });
  const bridgeMaterial = new THREE.MeshStandardMaterial({ color: "#d8c494", roughness: 0.76 });
  const railMaterial = new THREE.MeshStandardMaterial({ color: "#29343a", roughness: 0.62, metalness: 0.06 });

  cityRoutes.forEach((route) => {
    const material = route.kind === "rail" ? railMaterial : route.kind === "bridge" ? bridgeMaterial : roadMaterial;
    // Spur roads stop short of a plot so they meet the stop instead of
    // ploughing through the model standing on it.
    const end = plotPoints.has(route.end) ? trimTowards(route.start, route.end, 1.45) : route.end;
    addPathSegment(scene, route.start, end, route.width, material);
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
  path.position.set(start.x + dx / 2, 0.05, start.z + dz / 2);
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
  // Give the hall a face on the side the camera sees: doors, windows, a clock gable.
  const hallFront = learning.z - 2.55 + 0.73;
  addBox(group, [0.62, 0.66, 0.06], "#3a2a1c", [learning.x, 0.6, hallFront], [0, 0.04, 0]);
  [-1.85, -1.1, 1.1, 1.85].forEach((x) => {
    addBox(group, [0.44, 0.42, 0.05], glass, [learning.x + x, 0.88, hallFront - x * 0.04], [0, 0.04, 0]);
  });
  addPrism(group, [1.5, 0.5, 0.3], "#f7d35f", [learning.x, 1.54, hallFront - 0.12], 0.04);
  addCylinder(group, 0.15, 0.15, 0.04, "#fffdf4", [learning.x, 1.72, hallFront + 0.05], [Math.PI / 2, 0, 0], 16);
  addCylinder(group, 0.02, 0.02, 0.9, "#e8e2d2", [learning.x + 2.2, 2.0, learning.z - 2.55], [0, 0, 0], 6);
  addBox(group, [0.36, 0.2, 0.02], "#4cbad8", [learning.x + 2.39, 2.32, learning.z - 2.55]);

  addLandmarkSign(scene, addTexture, "Project Graveyard", "north shore old builds", graveyard.x - 1.25, graveyard.z - 4.85, "#7d8178");
  addLandmarkSign(scene, addTexture, "Learning Centre", "tutorials and practice", learning.x - 1.25, learning.z - 5.15, "#77cdd1");

  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}


function addLandscapeDetails(scene: THREE.Scene) {
  const details = new THREE.Group();
  scene.add(details);

  const wakeMaterial = new THREE.MeshBasicMaterial({ color: "#e9fbff", transparent: true, opacity: 0.54 });
  const rockMaterial = modelMaterial("#a58f66", { roughness: 0.92 });
  const courtMaterial = modelMaterial("#1f6f51", { roughness: 0.84 });
  const treeTrunk = modelMaterial("#72563a", { roughness: 0.78 });
  const treeGreen = modelMaterial("#246b3e", { roughness: 0.88 });
  const suburbWall = modelMaterial("#efe1bf", { roughness: 0.76 });
  const darkRoad = modelMaterial("#2b2f2b", { roughness: 0.78 });
  const parkPaint = modelMaterial("#315f40", { roughness: 0.88 });

  // Hand-placed scenery predates some stops, so it yields to them.
  const isClearOfStops = (point: MapPoint) =>
    !cityItems.some((item) => Math.hypot(point.x - item.x, point.z - item.z) < 2.9) &&
    !(
      Math.abs(point.x - archiveDistricts.learningCentre.center.x) < 6.3 &&
      Math.abs(point.z - archiveDistricts.learningCentre.center.z) < 4.9
    );

  const addTree = (point: MapPoint, scale = 1) => {
    if (!isClearOfStops(point)) return;
    addCylinder(details, 0.045 * scale, 0.06 * scale, 0.42 * scale, treeTrunk, [point.x, 0.27 * scale, point.z], [0, 0, 0], 10);
    addCone(details, 0.28 * scale, 0.62 * scale, 7, treeGreen, [point.x, 0.78 * scale, point.z]);
  };

  const addInlandHouse = (point: MapPoint, rotation: number, roofColor: string, scale = 1) => {
    if (!isClearOfStops(point)) return;
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

  addBox(details, [2.48, 0.035, 1.42], courtMaterial, [sydneyPlaces.queensPark.x - 0.25, 0.12, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);
  addBox(details, [2.48, 0.04, 0.045], "#fffdf4", [sydneyPlaces.queensPark.x - 0.25, 0.16, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);
  addBox(details, [0.045, 0.04, 1.42], "#fffdf4", [sydneyPlaces.queensPark.x - 0.25, 0.16, sydneyPlaces.queensPark.z + 1.45], [0, 0.08, 0]);

  for (let i = 0; i < 8; i += 1) {
    addBox(
      details,
      [0.56 + (i % 2) * 0.14, 0.22 + (i % 3) * 0.07, 0.46],
      rockMaterial,
      [sydneyPlaces.milsonsPoint.x - 3.1 + i * 0.72, 0.14 + (i % 2) * 0.04, sydneyPlaces.milsonsPoint.z + 1.78 + Math.sin(i) * 0.14],
      [0, -0.16 + i * 0.05, 0.03],
    );
  }

  // One jetty reaching off the Milsons Point shore into the harbour.
  addBox(details, [0.4, 0.07, 1.5], "#d5c7a6", [sydneyPlaces.milsonsPoint.x + 1.1, 0.12, sydneyPlaces.milsonsPoint.z + 2.35], [0, 0.06, 0], { roughness: 0.72 });
  addBox(details, [1.1, 0.07, 0.34], "#d5c7a6", [sydneyPlaces.milsonsPoint.x + 1.1, 0.12, sydneyPlaces.milsonsPoint.z + 3.0], [0, 0.06, 0], { roughness: 0.72 });

  // A few boats, all on open harbour water and clear of the bridge corridor.
  ([
    [-7.6, -11.6, -0.24, "#2f8ec7"],
    [0.5, -12.6, 0.42, "#f0c36a"],
    [-9.8, -12.4, 0.16, "#e6533f"],
  ] as const).forEach(([x, z, rotation, colour]) => {
    const ferry = new THREE.Group();
    ferry.position.set(x, 0, z);
    ferry.rotation.y = rotation;
    addBox(ferry, [1.04, 0.15, 0.34], "#fff7d6", [0, 0.12, 0], [0, 0, 0], { roughness: 0.44 });
    addBox(ferry, [0.66, 0.17, 0.24], colour, [-0.08, 0.27, 0], [0, 0, 0], { roughness: 0.38 });
    addBox(ferry, [0.26, 0.06, 0.26], "#151713", [0.42, 0.27, 0]);
    addBox(ferry, [1.2, 0.026, 0.042], wakeMaterial, [-0.74, 0.06, -0.18], [0, -0.2, 0]);
    addBox(ferry, [1.2, 0.026, 0.042], wakeMaterial, [-0.74, 0.06, 0.18], [0, 0.2, 0]);
    details.add(ferry);
  });

  details.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

function addHarbourBridgeArtwork(parent: THREE.Object3D) {
  const { south, north, deckY, deckWidth, rampLength } = HARBOUR_BRIDGE;
  const bridge = new THREE.Group();
  const dx = north.x - south.x;
  const dz = north.z - south.z;
  const span = Math.hypot(dx, dz);
  bridge.position.set((south.x + north.x) / 2, 0, (south.z + north.z) / 2);
  bridge.rotation.y = -Math.atan2(dz, dx);
  parent.add(bridge);

  // Everything is derived from the gap it crosses, so the arch springs from the
  // two shores instead of lying across the landscape.
  const half = span / 2;
  const archSpring = half * 0.92;
  const archPeak = deckY + span * 0.52;
  const halfWidth = deckWidth / 2;

  const steel = modelMaterial("#59686e", { roughness: 0.32, metalness: 0.16 });
  const darkSteel = modelMaterial("#2d3a40", { roughness: 0.42, metalness: 0.14 });
  const pylonMaterial = modelMaterial("#b3a68c", { roughness: 0.72 });
  const deckMaterial = modelMaterial("#464d50", { roughness: 0.52, metalness: 0.08 });
  const laneMaterial = new THREE.MeshBasicMaterial({ color: "#f7f1d1" });

  // Deck: wide enough for the ball to roll across, with a kerb either side.
  addBox(bridge, [span, 0.12, deckWidth + 0.14], "#7d8a8f", [0, deckY - 0.1, 0], [0, 0, 0], { roughness: 0.6 });
  addBox(bridge, [span, 0.08, deckWidth], deckMaterial, [0, deckY - 0.04, 0]);
  addBox(bridge, [span - 0.4, 0.02, 0.04], laneMaterial, [0, deckY + 0.01, 0]);
  [-1, 1].forEach((side) => {
    addBox(bridge, [span, 0.1, 0.1], darkSteel, [0, deckY + 0.05, side * (halfWidth + 0.05)]);
    addBox(bridge, [span, 0.2, 0.04], steel, [0, deckY + 0.2, side * (halfWidth + 0.08)]);
  });

  // Approach ramps: solid wedges the ball can climb from either shore.
  [-1, 1].forEach((end) => {
    const steps = 5;
    for (let step = 0; step < steps; step += 1) {
      const mid = (step + 0.5) / steps;
      const height = Math.max(0.05, deckY * (1 - mid));
      const centre = end * (half + rampLength * mid);
      addBox(
        bridge,
        [rampLength / steps + 0.02, 0.1, deckWidth + 0.14],
        "#7d8a8f",
        [centre, height + 0.02, 0],
        [0, 0, 0],
        { roughness: 0.62 },
      );
      addBox(bridge, [rampLength / steps + 0.02, height, deckWidth], pylonMaterial, [centre, height / 2, 0]);
    }
  });

  // Sandstone pylons at both ends, in pairs like the real crossing.
  [-1, 1].forEach((end) => {
    [-1, 1].forEach((side) => {
      const x = end * half * 0.96;
      const z = side * (halfWidth + 0.34);
      addBox(bridge, [0.46, 1.9, 0.5], pylonMaterial, [x, 0.95, z]);
      addBox(bridge, [0.58, 0.14, 0.62], pylonMaterial, [x, 1.97, z]);
      addBox(bridge, [0.3, 0.24, 0.32], pylonMaterial, [x, 2.16, z]);
      addBox(bridge, [0.11, 0.2, 0.03], "#4f5657", [x, 1.26, z + side * 0.27]);
    });
  });

  // The arch, its hangers and cross-bracing between the two ribs.
  const archZ = [-(halfWidth + 0.14), halfWidth + 0.14];
  const curves = archZ.map((z) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-archSpring, deckY + 0.1, z),
      new THREE.Vector3(0, archPeak + (archPeak - deckY) * 0.55, z),
      new THREE.Vector3(archSpring, deckY + 0.1, z),
    );
    const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.06, 6, false), steel);
    arch.castShadow = true;
    bridge.add(arch);
    return curve;
  });
  curves.forEach((curve, index) => {
    for (let i = 1; i < 9; i += 1) {
      const t = i / 9;
      const top = curve.getPoint(t);
      if (top.y <= deckY + 0.3) continue;
      const foot = new THREE.Vector3(top.x, deckY + 0.26, archZ[index]);
      addCylinderBetween(bridge, foot, top, 0.016, darkSteel);
    }
  });
  for (let i = 1; i < 6; i += 1) {
    const t = i / 6;
    addCylinderBetween(bridge, curves[0].getPoint(t), curves[1].getPoint(t), 0.022, steel);
  }
  return bridge;
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
  } = sydneyPlaces;
  const pitchCenter = nudgePoint(sportsField, 0.45, 0.3);

  // Circular Quay: a quay along the shore rather than a slab over the harbour.
  addBox(landmarks, [5.2, 0.14, 1.35], "#e8d9b6", [operaHouse.x - 0.5, 0.07, operaHouse.z + 1.55]);
  addBox(landmarks, [2.4, 0.08, 0.8], "#d5c7a6", [operaHouse.x + 0.55, 0.15, operaHouse.z + 2.05], [0, -0.2, 0]);

  addHarbourBridgeArtwork(landmarks);

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
      northSydney.z - 1.95 + Math.floor(i / 8) * 2.35 + (i % 2) * 0.12,
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

  // Dover Heights is clifftop country, but a stack of blocks in the middle of
  // the suburb just read as rubble. A couple of low outcrops off to one side
  // give the same hint without fighting the roads.
  const cliffMaterial = modelMaterial("#c3ab80", { roughness: 0.88 });
  ([
    [-2.15, -1.55, 1.5, 0.34, 0.9],
    [-2.75, -0.55, 1.05, 0.24, 0.7],
    [-1.55, -2.35, 0.8, 0.19, 0.62],
  ] as const).forEach(([dx, dz, width, height, depth], index) => {
    addBox(
      landmarks,
      [width, height, depth],
      cliffMaterial,
      [doverHeights.x + dx, height / 2, doverHeights.z + dz],
      [0, -0.24 + index * 0.18, 0],
    );
  });

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
  addLandmarkSign(scene, addTexture, "North Sydney", "other side of the bridge", northSydney.x - 1.35, northSydney.z + 2.0, "#7da3a9");
  addLandmarkSign(scene, addTexture, "Milsons Point", "bridge landing", milsonsPoint.x + 1.9, milsonsPoint.z + 1.0, "#f0c36a");
  addLandmarkSign(scene, addTexture, "CBD", "city core", cbd.x + 1.45, cbd.z + 2, "#7da3a9");
  addLandmarkSign(scene, addTexture, "Surry Hills", "Blackbird block", blackbird.x + 1.9, blackbird.z - 2.0, "#22d66f");
  addLandmarkSign(scene, addTexture, "Eveleigh", "Quantium data yard", eveleigh.x + 1.35, eveleigh.z + 1.35, "#2f8ec7");
  addLandmarkSign(scene, addTexture, "Bondi Junction", "spreadsheet campus", bondiJunction.x + 0.65, bondiJunction.z - 1.35, "#18b96f");
  addLandmarkSign(scene, addTexture, "Queens Park", "Moriah College", queensPark.x - 2.3, queensPark.z + 1.1, "#ff5b2e");
  addLandmarkSign(scene, addTexture, "Dover Heights", "home base", doverHeights.x - 1.25, doverHeights.z + 1.35, "#f0c36a");
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
  // Standing sign on the same bearing as the project placards, so every piece of
  // text on the map reads square to the camera.
  const width = 1.95;
  const height = width / 3;
  const postHeight = 0.34;
  const sign = new THREE.Group();
  sign.position.set(x, 0, z);
  sign.rotation.set(PLAQUE_TILT, cameraYaw(CAMERA_VIEWS.wide), 0);
  addBox(sign, [width + 0.07, height + 0.07, 0.04], "#fffdf4", [0, postHeight + height / 2, 0], [0, 0, 0], {
    roughness: 0.66,
  });
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );
  board.position.set(0, postHeight + height / 2, 0.028);
  sign.add(board);
  [-1, 1].forEach((side) => {
    addBox(sign, [0.055, postHeight + 0.1, 0.055], "#5d6157", [side * (width / 2 - 0.14), (postHeight + 0.1) / 2, 0]);
  });
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
  // Archive cards open in place instead of throwing the reader back to the map.
  const [cardProject, setCardProject] = useState<Project | null>(null);
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
    setDetailMode(landmarkStopIds.has(id) ? "closed" : "pinned");
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
    if (!cardProject) return undefined;
    const closeCardOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCardProject(null);
    };
    document.addEventListener("keydown", closeCardOnEscape);
    document.body.classList.add("has-project-modal");
    return () => {
      document.removeEventListener("keydown", closeCardOnEscape);
      document.body.classList.remove("has-project-modal");
    };
  }, [cardProject]);

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
    if (landmarkStopIds.has(id)) {
      setDetailMode((mode) => (mode === "auto" ? "closed" : mode));
      return;
    }
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
              {siteData.hero.kicker}
            </p>
            <h1 id="hero-title">{siteData.hero.name}</h1>
            <p>{siteData.hero.intro}</p>
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
              <div className="stage-dock">
                <div className="interest-strip" aria-label="Jump to a place on the map">
                  {mapShortcutButtons.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={activeId === id ? "is-active" : ""}
                      onClick={() => openProjectDetails(id)}
                    >
                      <Icon size={15} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="stage-hint" aria-hidden="true">
                  <kbd>WASD</kbd> roll <kbd>Space</kbd> jump <kbd>Click</kbd> travel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="archive-section" id="archive" aria-labelledby="archive-title">
        <div className="section-copy">
          <p className="eyebrow">{siteData.sections.archive.eyebrow}</p>
          <h2 id="archive-title">{siteData.sections.archive.heading}</h2>
          <p>{siteData.sections.archive.intro}</p>
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
                className={`archive-card ${project.id === cardProject?.id ? "is-active" : ""}`}
                key={project.id}
                type="button"
                onClick={() => setCardProject(project)}
                aria-haspopup="dialog"
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
          <p className="eyebrow">{siteData.sections.experience.eyebrow}</p>
          <h2 id="experience-title">{siteData.sections.experience.heading}</h2>
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
          <p className="eyebrow">{siteData.sections.contact.eyebrow}</p>
          <h2 id="contact-title">{siteData.sections.contact.heading}</h2>
          <p>{siteData.sections.contact.intro}</p>
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
        {siteData.footer.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </footer>

      {cardProject ? (
        <div
          className="project-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${cardProject.title} details`}
        >
          <button
            className="project-modal-scrim"
            type="button"
            onClick={() => setCardProject(null)}
            aria-label="Close project details"
          />
          <div className="project-modal-card">
            <ProjectInspector project={cardProject} onClose={() => setCardProject(null)} />
          </div>
        </div>
      ) : null}
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
