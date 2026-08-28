"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  Check,
  Tag,
  Zap,
} from "lucide-react";
import { CartState, RecommendationItem } from "./types";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  cart: CartState | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity?: (productId: string, newQty: number) => Promise<void> | void;
  onRemoveItem?: (productId: string) => Promise<void> | void;
  onAddToCart?: (productId: string) => Promise<void> | void;
  onCheckoutPrompt?: () => void;
}

export function CartDrawer({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onCheckoutPrompt,
}: CartDrawerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [addingRecId, setAddingRecId] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const subtotal = cart?.subtotal || totalAmount;
  const itemCount = cart?.itemCount || 0;
  const recommendations = (cart?.recommendations || []).filter(
    (rec) => !items.some((it) => it.productId === rec.productId)
  );

  const handleQtyChange = async (productId: string, newQty: number) => {
    if (!onUpdateQuantity || updatingId) return;
    setUpdatingId(productId);
    try {
      await onUpdateQuantity(productId, newQty);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!onRemoveItem || updatingId) return;
    setUpdatingId(productId);
    try {
      await onRemoveItem(productId);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddRec = async (productId: string) => {
    if (!onAddToCart || addingRecId) return;
    setAddingRecId(productId);
    try {
      await onAddToCart(productId);
    } finally {
      setAddingRecId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="shrink-0">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Your Shopping Cart</h3>
                  <p className="text-[11px] text-zinc-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"} • Server-Verified Pricing
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Middle Area: Items + Upsells */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
                <ShoppingBag className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Ask the AI copilot: &ldquo;Find a coding laptop under ₹80k&rdquo; to add verified items.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">
                  <span>Selected Items</span>
                  <span>Price</span>
                </div>

                {items.map((item) => {
                  const isUpdating = updatingId === item.productId;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-xl border border-zinc-800/90 bg-zinc-900/70 p-3.5 transition-all hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h4 className="font-semibold text-xs text-zinc-100 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            ₹{item.price.toLocaleString("en-IN")} each
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-white whitespace-nowrap block">
                            ₹{item.subtotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-1.5 py-0.5">
                          <button
                            onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                            disabled={isUpdating}
                            className="text-zinc-400 hover:text-white p-0.5 disabled:opacity-40"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-mono text-[11px] font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= item.stock}
                            className="text-zinc-400 hover:text-white p-0.5 disabled:opacity-40"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition-colors p-1"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Upsell & Cross-Sell Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  <span>AI Recommended Pairings</span>
                </div>

                <div className="space-y-2.5">
                  {recommendations.slice(0, 2).map((rec) => {
                    const isAdding = addingRecId === rec.productId;

                    return (
                      <div
                        key={rec.id}
                        className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-zinc-900/60 to-zinc-900/40 p-3 flex flex-col gap-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                                {rec.category}
                              </span>
                              <span className="inline-flex items-center text-[9px] text-emerald-400 font-semibold">
                                • In Stock ({rec.stock})
                              </span>
                            </div>
                            <h5 className="font-semibold text-xs text-white line-clamp-1 mt-0.5">
                              {rec.name}
                            </h5>
                          </div>

                          <span className="text-xs font-bold text-indigo-300 whitespace-nowrap">
                            ₹{rec.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Explainable AI Reasoning */}
                        <div className="rounded-lg bg-indigo-950/60 border border-indigo-500/20 px-2.5 py-1.5 text-[11px] text-indigo-200 leading-snug">
                          <p className="italic text-zinc-300">
                            💡 &ldquo;{rec.reason}&rdquo;
                          </p>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleAddRec(rec.productId)}
                            disabled={isAdding}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isAdding ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            <span>Add Pairing</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 ? (
            <div className="pt-3 border-t border-zinc-800 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Taxes</span>
                  <span className="text-emerald-400 font-medium">Free Express Delivery</span>
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
                <span>Deterministic server verification active.</span>
              </div>

              <Button
                onClick={() => {
                  onClose();
                  if (onCheckoutPrompt) onCheckoutPrompt();
                }}
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-800 text-center text-xs text-zinc-500 shrink-0">
              FlowCommerce • Deterministic Bounded Guardrails
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

