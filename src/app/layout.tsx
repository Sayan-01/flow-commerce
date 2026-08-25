import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
});

import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "FlowCommerce — AI Sales & Checkout Shopping Agent",
  description: "Agentic commerce with bounded server-validated guardrails, Razorpay checkout, and merchant AI revenue analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.className} h-full antialiased`}
    >
      <body
        cz-shortcut-listen="true"
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
