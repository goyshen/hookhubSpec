import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HookHub",
  description: "Open source hooks for Claude Code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="sticky top-0 z-10 border-b border-black/[.08] bg-white/80 backdrop-blur dark:border-white/[.145] dark:bg-black/80">
          <div className="mx-auto flex w-full max-w-6xl items-baseline gap-3 px-6 py-4 sm:px-10">
            <span className="text-lg font-semibold text-black dark:text-zinc-50">
              HookHub
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Open source hooks for Claude Code
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col">{children}</div>

        <footer className="border-t border-black/[.08] py-6 dark:border-white/[.145]">
          <div className="mx-auto w-full max-w-6xl px-6 text-sm text-zinc-500 dark:text-zinc-400 sm:px-10">
            <a
              href="https://code.claude.com/docs/en/hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Claude Code hooks documentation &rarr;
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
