"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ShieldCheck, Store, Sparkles, ShoppingBag } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Overview", icon: Sparkles },
    { href: "/chat", label: "AI Shopping Agent", icon: Bot, highlight: true },
    { href: "/merchant/products", label: "Catalog & Stock", icon: Store },
    { href: "/merchant/audit", label: "Audit & AI Revenue", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                Flow<span className="text-indigo-600 dark:text-indigo-400">Commerce</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-400/20">
                Agentic
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                } ${link.highlight && !isActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-blue-500 hover:shadow-md hover:shadow-indigo-500/20 active:scale-98 transition-all"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Start Chat Shopping</span>
            <span className="sm:hidden">Chat</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
