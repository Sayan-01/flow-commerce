import React, { Suspense } from "react";
import { Metadata } from "next";
import { ChatContainer } from "@/components/chat";
import { Loader2 } from "lucide-react";
import { auth } from "../../../auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Shopping Agent — FlowCommerce",
  description: "Chat with the FlowCommerce AI Shopping Copilot for tech recommendations, real-time stock checks, and bounded checkout.",
};

export default async function ChatPage() {
  const session = await auth();

  return (
    <div className="min-h-[calc(100vh-78.5px)]  text-zinc-100 flex flex-col justify-between">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-[calc(100vh-78.5px)] text-zinc-400">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-medium">Connecting to FlowCommerce Copilot...</p>
          </div>
        }
      >
        <ChatContainer />
      </Suspense>
    </div>
  );
}
