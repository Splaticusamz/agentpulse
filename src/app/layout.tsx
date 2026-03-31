import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentPulse — AI Agent Uptime Monitor & Status Pages",
  description: "Monitor MCP servers, ACP manifests, and LLM endpoints. Automated health checks, public status pages, and uptime badges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-emerald-400">⚡</span> AgentPulse
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white transition">Home</Link>
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">Dashboard</Link>
              <a href="#pricing" className="text-zinc-400 hover:text-white transition">Pricing</a>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-1.5 rounded-lg transition text-sm">Get Started</button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
