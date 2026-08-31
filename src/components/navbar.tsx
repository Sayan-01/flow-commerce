"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ShieldCheck, Store, Sparkles, ShoppingBag, LogIn, LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { Sign_Out } from "../../server/auth/auth";

interface NavbarProps {
  session?: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Overview", icon: Sparkles },
    { href: "/chat", label: "AI Shopping Agent", icon: Bot, highlight: true },
    { href: "/merchant/products", label: "Catalog & Stock", icon: Store },
    { href: "/merchant/audit", label: "Audit & AI Revenue", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-4.5">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald text-paper shadow-md shadow-emerald/20 group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-ink">
                Flow<span className="text-emerald">Commerce</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-2 px-2 py-0.5 text-[10px] font-semibold text-emerald border border-emerald/20">
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
                    ? "bg-card text-ink font-semibold border border-line"
                    : "text-ink-soft hover:bg-card hover:text-ink"
                } ${link.highlight && !isActive ? "text-emerald font-semibold" : ""}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald" : ""}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald/20 border border-emerald/60 px-3.5 py-2 text-sm font-medium text-ink shadow-sm">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-paper">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-ink-soft max-w-[100px] truncate">{session.user.name?.split(" ")[0] || "User"}</span>
              </div>
              <form action={Sign_Out}>
                <button
                  type="submit"
                  title="Sign out"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-line bg-card text-ink-soft hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald px-4.5 py-2 text-sm font-semibold text-paper shadow-sm hover:opacity-90 active:scale-98 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
