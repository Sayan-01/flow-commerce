"use client";

import React, { useState } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Loader2 } from "lucide-react";
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

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem, onAddToCart, onCheckoutPrompt }: CartDrawerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [addingRecId, setAddingRecId] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const subtotal = cart?.subtotal || totalAmount;
  const itemCount = cart?.itemCount || 0;
  const recommendations = (cart?.recommendations || []).filter((rec) => !items.some((it) => it.productId === rec.productId));

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
        className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111113] border-l border-[#232326] p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="shrink-0">
            <div className="flex items-center justify-between pb-4 border-b border-[#232326]">
              <div>
                <h3 className="font-medium text-[15px] text-[#F2F1ED]">Cart</h3>
                <p className="text-xs text-[#7C7C82] mt-0.5">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-[#7C7C82] hover:bg-[#1B1B1E] hover:text-[#F2F1ED] transition-colors"
                title="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Middle Area: Items + Upsells */}
          <div className="flex-1 overflow-y-auto my-5 space-y-5 pr-1 box_1">
            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="text-center py-14 px-4 rounded-lg border border-dashed border-[#26262A]">
                <ShoppingBag
                  className="h-5 w-5 text-[#4D4D52] mx-auto mb-3"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-[#C7C6C2]">Your cart is empty</p>
                <p className="text-xs text-[#6C6C72] mt-1.5 max-w-[240px] mx-auto leading-relaxed">Try asking the copilot to find something — e.g. &ldquo;a coding laptop under ₹80k.&rdquo;</p>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => {
                  const isUpdating = updatingId === item.productId;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2.5 rounded-lg border border-[#232326] bg-[#151517] p-3.5 transition-colors hover:border-[#333338]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-11 w-11 rounded-md object-cover bg-[#0B0B0C] border border-[#232326] shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-md bg-[#0B0B0C] border border-[#232326] flex items-center justify-center text-[#4D4D52] shrink-0">
                              <ShoppingBag
                                className="h-4 w-4"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] text-[#7C7C82]">{item.category}</span>
                            <h4 className="font-medium text-[13px] text-[#F2F1ED] truncate leading-snug">{item.name}</h4>
                            <span className="text-[11px] text-[#7C7C82]">₹{item.price.toLocaleString("en-IN")} each</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[13px] font-medium text-[#F2F1ED] whitespace-nowrap block">₹{item.subtotal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#1E1E21] text-xs">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 rounded-md border border-[#26262A] px-1.5 py-1">
                          <button
                            onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                            disabled={isUpdating}
                            className="text-[#9B9BA1] hover:text-[#F2F1ED] p-0.5 disabled:opacity-30"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-[11px] text-[#F2F1ED]">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= item.stock}
                            className="text-[#9B9BA1] hover:text-[#F2F1ED] p-0.5 disabled:opacity-30"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 text-[11px] text-[#7C7C82] hover:text-[#C97C74] transition-colors p-1"
                          title="Remove from cart"
                        >
                          <Trash2
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="pt-4 border-t  space-y-4">
                <p className="text-xs text-[#7C7C82]">Pairs well with your cart</p>

                <div className="space-y-5">
                  {recommendations.slice(0, 2).map((rec) => {
                    const isAdding = addingRecId === rec.productId;

                    return (
                      <div
                        key={rec.id}
                        className="rounded-lg border border-[#232326] bg-[#141416] p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] text-[#7C7C82]">{rec.category}</span>
                            <h5 className="font-medium text-[13px] text-[#F2F1ED] truncate leading-snug">{rec.name}</h5>
                          </div>
                          <span className="text-[13px] font-medium text-[#C9A961] whitespace-nowrap">₹{rec.price.toLocaleString("en-IN")}</span>
                        </div>

                        <p className="text-[11px] text-[#8C8C92] italic leading-relaxed">{rec.reason}</p>

                        <div className="flex justify-end pt-0.5">
                          <button
                            onClick={() => handleAddRec(rec.productId)}
                            disabled={isAdding}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#26262A] text-[#F2F1ED] hover:border-[#C9A961] hover:text-[#C9A961] transition-colors disabled:opacity-50"
                          >
                            {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                            <span>Add</span>
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
            <div className="pt-4 border-t border-[#232326] space-y-4 shrink-0">
              <div className="space-y-1.5 text-xs text-[#8C8C92]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#D8D8D4]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#7FA88F]">Free</span>
                </div>
                <div className="flex mt-4 justify-between text-sm font-medium text-[#F2F1ED] pt-2.5 border-t">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  onClose();
                  if (onCheckoutPrompt) onCheckoutPrompt();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-700 text-[#14120C] font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#1E1E21] text-center text-[11px] text-[#5A5A5F] shrink-0">FlowCommerce</div>
          )}
        </div>
      </div>
    </div>
  );
}
