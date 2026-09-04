import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
});

import { Navbar } from "@/components/navbar";
import { auth } from "../../auth";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "FlowCommerce — AI Sales & Checkout Shopping Agent",
  description: "Agentic commerce with bounded server-validated guardrails, Razorpay checkout, and merchant AI revenue analytics.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  console.log("Root User Id:", session?.user?.id);

  return (
    <SessionProvider session={session}>
      <html
        lang="en"
        className={`${sora.className} h-full antialiased`}
      >
        <body
          cz-shortcut-listen="true"
          className="min-h-full dark flex flex-col"
        >
          <Navbar session={session} />
          <main className="flex-1 flex flex-col">{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
}
