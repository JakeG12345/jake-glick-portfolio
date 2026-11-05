import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Local content API for the /studio editor.
 *
 * This writes to files in the repo, so it exists only while running `next dev`.
 * In a production build every method returns 404, which means a deployed copy of
 * the site has no write endpoint at all.
 */
const EDITABLE = {
  projects: "projects.json",
  city: "city.json",
  site: "site.json",
} as const;

type EditableFile = keyof typeof EDITABLE;

const isDev = process.env.NODE_ENV !== "production";
const dataDir = path.join(process.cwd(), "app", "data");

const notFound = () => new Response("Not found", { status: 404 });

function resolve(file: string | null): EditableFile | null {
  return file && file in EDITABLE ? (file as EditableFile) : null;
}

async function readFile(file: EditableFile) {
  return JSON.parse(await fs.readFile(path.join(dataDir, EDITABLE[file]), "utf8"));
}

export async function GET() {
  if (!isDev) return notFound();
  const [projects, city, site] = await Promise.all([
    readFile("projects"),
    readFile("city"),
    readFile("site"),
  ]);
  return Response.json({ projects, city, site });
}

export async function POST(request: Request) {
  if (!isDev) return notFound();

  const file = resolve(new URL(request.url).searchParams.get("file"));
  if (!file) return Response.json({ error: "Unknown file" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body was not valid JSON" }, { status: 400 });
  }

  // Guard against a half-built form wiping a file: projects and city are
  // non-empty arrays, site is an object with the keys the page reads.
  if (file === "projects" || file === "city") {
    if (!Array.isArray(body) || body.length === 0) {
      return Response.json({ error: `${file} must be a non-empty array` }, { status: 400 });
    }
  } else if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "site must be an object" }, { status: 400 });
  }

  const target = path.join(dataDir, EDITABLE[file]);
  const temporary = `${target}.tmp`;
  const contents = `${JSON.stringify(body, null, 2)}\n`;
  await fs.writeFile(temporary, contents, "utf8");
  await fs.rename(temporary, target);

  return Response.json({ saved: file, bytes: contents.length });
}
