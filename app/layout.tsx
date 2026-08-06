import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jake Glick | Portfolio City",
  description:
    "A 3D portfolio city for Jake Glick: web apps, mobile games, spreadsheet tools, data-story projects, local artifacts, and contact links.",
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
