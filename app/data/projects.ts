import projectsData from "./projects.json";

export type ProjectLink = {
  label: string;
  href: string;
  kind: "repo" | "live" | "video" | "store";
};

export type ProjectTier = "flagship" | "built" | "artifact" | "learning";

export type Project = {
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
  mapKind?: "graveyard" | "learning";
  color: string;
  x: number;
  z: number;
  /** Y rotation in radians for the 3D model, e.g. to align a stop with the coast. */
  heading?: number;
  height: number;
  links: ProjectLink[];
};

// The array lives in projects.json so the /studio editor can rewrite it
// without touching TypeScript. The shape is enforced by the cast below.
export const projects: Project[] = projectsData as Project[];

export const projectById = new Map(projects.map((project) => [project.id, project]));

export const projectImageOverrides: Record<string, string> = {
  "daily-excel": "/projects/daily-excel.png",
  "daily-challenge-app": "/projects/jashby.png",
  "old-carstory": "/projects/car-lifestory.png",
  "jiujitsu-prisma": "/projects/brackets.webp",
  portfolio: "/projects/portfolio-city.jpg",
};

export function projectImageSrc(project: Project) {
  return projectImageOverrides[project.id] ?? project.image ?? `/projects/generated/${project.id}.svg`;
}

export function projectImageAlt(project: Project) {
  return project.imageAlt ?? `${project.title} project image`;
}

export function isSvgImage(src: string) {
  return src.endsWith(".svg");
}

export function featuredProject(id: string, overrides: Partial<Project>): Project {
  const project = projectById.get(id);
  if (!project) throw new Error(`Missing featured project: ${id}`);
  return { ...project, ...overrides };
}
