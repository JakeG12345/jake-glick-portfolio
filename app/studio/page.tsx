import { notFound } from "next/navigation";
import Studio from "./Studio";

export const metadata = { title: "Studio | Jake Glick" };

export default function StudioPage() {
  // The editor writes to files in the repo, so it only exists in `next dev`.
  if (process.env.NODE_ENV === "production") notFound();
  return <Studio />;
}
