"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, X, CreditCard, AlertTriangle, Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OrderItemData {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  isUpsell: boolean;
  reason?: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl?: string | null;
  };
}

export interface ProposedOrderData {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: string;
  razorpayOrderId?: string | null;
  items: OrderItemData[];
  createdAt: string;
}

interface CheckoutModalProps {
  order: ProposedOrderData | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (paymentDetails: any) => void;
}

export function CheckoutModal({ order, isOpen, onClose, onPaymentSuccess }: CheckoutModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamically load Razorpay SDK in browser
  useEffect(() => {
    const existingScript = document.getElementById("razorpay-sdk");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen || !order) return null;

  const verifyPaymentAndRedirect = async (paymentPayload: any) => {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Payment signature verification failed.");
      }

      if (onPaymentSuccess) onPaymentSuccess(paymentPayload);
      onClose();

      // Redirect to order receipt page
      window.location.href = `/order/${order.id}`;
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to verify payment signature.");
    } finally {
      setIsConfirming(false);
    }
  };

  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        return resolve(true);
      }
      const existingScript = document.getElementById("razorpay-sdk");
      if (existingScript) {
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      // 1. Ensure Razorpay SDK script is ready
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 2. Create actual order in Razorpay via API
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(order.totalAmount * 100), // amount in paise
        }),
      });

      const data = await res.json();
      if (!data.success || !data.order) {
        throw new Error(data.error || "Failed to initiate Razorpay order.");
      }

      const razorpayOrder = data.order;
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 3. Open official Razorpay checkout portal
      const paymentData = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "FlowCommerce",
        description: `Order #${order.id.slice(-8)} Payment`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          const paymentPayload = {
            orderId: order.id,
            razorpay_order_id: response.razorpay_order_id || razorpayOrder.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          await verifyPaymentAndRedirect(paymentPayload);
        },
        prefill: {
          name: "Customer",
          email: "customer@flowcommerce.ai",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setIsConfirming(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(paymentData);
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while opening Razorpay.");
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-zinc-100">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg text-white">Order Review & Confirmation</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Order <span className="font-mono text-indigo-300">#{order.id.slice(-8)}</span> •{" "}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">{order.status}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="my-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Itemized Line Items List */}
          <div className="my-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Itemized Line Items (Price Snapshotted)</h4>

            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-3 flex flex-col gap-1.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase">{item.product?.category || "Product"}</span>
                      {item.isUpsell && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI Upsell Pairing</span>
                        </span>
                      )}
                    </div>
                    <h5 className="font-semibold text-xs text-zinc-100 mt-0.5">{item.product?.name || "Verified Product"}</h5>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white whitespace-nowrap block">₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                    </span>
                  </div>
                </div>

                {item.reason && <p className="text-[11px] text-zinc-400 italic bg-zinc-950/60 rounded px-2 py-1 border border-zinc-800/60">💡 &ldquo;{item.reason}&rdquo;</p>}
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 rounded-xl bg-zinc-900/80 border border-zinc-800 p-3.5 text-xs text-zinc-300 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Delivery</span>
              <span className="text-emerald-400 font-medium">Free Express Delivery</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total Amount</span>
              <span className="text-base text-indigo-400 font-extrabold">₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Explicit Confirmation Gate Security Notice */}
          <div className="mb-5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900 border border-indigo-500/30 p-3 flex items-start gap-2.5 text-xs text-indigo-200">
            <Lock className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Direct Razorpay Gateway Integration</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Clicking confirm directly opens the official Razorpay payment portal with secure UPI, Cards, and Net Banking options.
              </p>
            </div>
          </div>

          {/* The Payment Action Button */}
          <Button
            onClick={handlePay}
            disabled={isConfirming}
            className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Opening Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Pay ₹{order.totalAmount.toLocaleString("en-IN")} with Razorpay</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
