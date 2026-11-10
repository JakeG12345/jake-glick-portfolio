import type { Metadata, Viewport } from "next";
import "./globals.css";

const description =
  "A walkable 3D Sydney built from Jake Glick's work: web apps, mobile games, spreadsheet tools, data stories and the archive behind them.";

export const metadata: Metadata = {
  title: "Jake Glick | Portfolio City",
  description,
  openGraph: {
    title: "Jake Glick | Portfolio City",
    description,
    type: "website",
    images: [{ url: "/projects/portfolio-city.jpg" }],
  },
  twitter: { card: "summary_large_image", title: "Jake Glick | Portfolio City", description },
};

export const viewport: Viewport = {
  themeColor: "#121812",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
