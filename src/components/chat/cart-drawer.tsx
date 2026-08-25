"use client";

import React from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CartState } from "./types";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  cart: CartState | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity?: (productId: string, newQty: number) => void;
  onCheckoutPrompt?: () => void;
}

export function CartDrawer({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onCheckoutPrompt,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const itemCount = cart?.itemCount || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Your Shopping Cart</h3>
                  <p className="text-[11px] text-zinc-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"} • Server Verified
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {items.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
                  <ShoppingBag className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    Ask the AI agent: &ldquo;I need a coding laptop under ₹80k&rdquo; to add verified items.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 transition-all hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="font-semibold text-xs text-zinc-100 line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        ₹{item.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                      <span className="text-[11px] text-zinc-400 font-mono">
                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                      </span>

                      {/* Quantity stepper */}
                      {onUpdateQuantity && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-1.5 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            className="text-zinc-400 hover:text-white p-0.5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-mono text-[11px] font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            className="text-zinc-400 hover:text-white p-0.5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Taxes</span>
                  <span className="text-emerald-400 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800/80">
                  <span>Total Amount</span>
                  <span className="text-base text-indigo-400">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Bounded Confirmation Notice */}
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Deterministic server verification enabled.</span>
              </div>

              <Button
                onClick={() => {
                  onClose();
                  if (onCheckoutPrompt) onCheckoutPrompt();
                }}
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
