"use client";

import React, { useState } from "react";
import { Bot, User, Wrench, ChevronDown, ChevronUp, Sparkles, ShoppingBag, CheckCircle2, Package } from "lucide-react";
import { ChatMessageItem, ToolExecution } from "./types";
import { ProductCard, ProductCardData } from "./product-card";
import { AlternativeProductCard } from "./alternative-product-card";
import MarkdownRenderer from "@/lib/markdownRendered";

interface ChatMessageProps {
  message: ChatMessageItem;
  onAddToCart?: (productId: string) => Promise<void> | void;
  onAskDetails?: (productName: string) => void;
}

export function ChatMessage({ message, onAddToCart, onAskDetails }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const toolExecutions = message.toolExecutions || [];

  const isAlternativeSuggestion = toolExecutions.some(
    (tool) => tool.name === "searchProducts" && tool.result?.isAlternativeSuggestion === true
  );

  // Extract products from all tool execution outputs
  const extractedProducts: ProductCardData[] = [];
  const seenIds = new Set<string>();

  toolExecutions.forEach((tool) => {
    if (tool.name === "searchProducts") {
      const candidates = [
        ...(Array.isArray(tool.result?.products) ? tool.result.products : []),
        ...(Array.isArray(tool.result?.closestAvailableMatches) ? tool.result.closestAvailableMatches : []),
        ...(Array.isArray(tool.result?.budgetAlternatives) ? tool.result.budgetAlternatives : []),
      ];
      candidates.forEach((p: any) => {
        if (p && p.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          extractedProducts.push(p);
        }
      });
    } else if (tool.name === "getProductDetails" && tool.result?.product) {
      const p = tool.result.product;
      if (p && p.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        extractedProducts.push(p);
      }
    }
  });

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col max-w-[90%] sm:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Tool Invocations Badge (if any) */}
        {!isUser && toolExecutions.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-[11px] font-mono text-indigo-300 hover:bg-indigo-900/50 transition-colors"
            >
              <Wrench className="h-3 w-3 text-indigo-400" />
              <span>
                {toolExecutions.length} tool{toolExecutions.length > 1 ? "s" : ""} executed
              </span>
              {toolsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {/* Expanded Tool Invocations List */}
            {toolsExpanded && (
              <div className="mt-2 space-y-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 font-mono text-xs">
                {toolExecutions.map((tool, idx) => (
                  <div key={tool.id || idx} className="flex flex-col gap-1 border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>λ {tool.name}()</span>
                      <span className="text-[10px] text-emerald-400 font-bold">SUCCESS</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 truncate">args: {JSON.stringify(tool.args)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/10"
              : "rounded-tl-sm border border-zinc-800 bg-zinc-900/70 text-zinc-200 shadow-sm backdrop-blur-md"
          }`}
        >
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Render Product Cards: Horizontal if alternatives, Grid if exact matches */}
        {!isUser && extractedProducts.length > 0 && (
          <div className="mt-3.5 w-full">
            {isAlternativeSuggestion ? (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90 tracking-wide px-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Similar & Recommended Alternatives</span>
                </div>
                {extractedProducts.slice(0, 4).map((product) => (
                  <AlternativeProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onAskDetails={onAskDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {extractedProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onAskDetails={onAskDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
