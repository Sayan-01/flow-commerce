"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const QUICK_PROMPT_SUGGESTIONS = [
  "💻 Laptops for coding under ₹80,000",
  "⌨️ Mechanical keyboards with high tactility",
  "🎧 Noise-canceling wireless headphones",
  "🛒 Show my current cart",
];

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSendMessage(input.trim());
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    // Strip leading emoji
    const cleanPrompt = prompt.replace(/^[\p{Emoji}\s]+/u, "");
    onSendMessage(cleanPrompt);
  };

  return (
    <div className="space-y-3">
      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-scroll pb-1 no-scrollbar">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 shrink-0 mr-1">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>Suggestions:</span>
        </div>
        {QUICK_PROMPT_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickPrompt(s)}
            className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-950/30 hover:text-indigo-200 transition-all disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-lg backdrop-blur-md focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask for developer gear, budget laptops, or accessory pairings..."
          disabled={isLoading || disabled}
          rows={1}
          className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 p-0 text-white shadow-md hover:bg-indigo-500 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
        <span>Press <kbd className="font-mono text-zinc-400">Enter</kbd> to send, <kbd className="font-mono text-zinc-400">Shift+Enter</kbd> for newline</span>
        <span className="text-emerald-400 font-medium">Model: stealth/ox-alpha</span>
      </div>
    </div>
  );
}
