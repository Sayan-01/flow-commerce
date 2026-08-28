"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
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

export function CheckoutModal({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"card" | "upi">("card");
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  // Load Razorpay Script in head dynamically
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
      setIsRazorpayModalOpen(false);
      onClose();

      // Redirect to full order receipt page
      window.location.href = `/order/${order.id}`;
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to verify payment signature.");
    }
  };

  const handleConfirmGate = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      // 1. Invoke Human-Only Confirmation Gate
      const res = await fetch(`/api/orders/${order.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to confirm order.");
      }

      setRazorpayConfig(data.razorpayConfig);

      // 2. Try launching official Razorpay Checkout SDK if loaded and live key exists
      if (
        typeof window !== "undefined" &&
        (window as any).Razorpay &&
        data.razorpayConfig?.key &&
        !data.razorpayConfig.key.includes("placeholder") &&
        !data.razorpayConfig.key.includes("flowcommerce")
      ) {
        try {
          const options = {
            ...data.razorpayConfig,
            handler: function (response: any) {
              const paymentPayload = {
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id || order.razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };
              verifyPaymentAndRedirect(paymentPayload);
            },
            modal: {
              ondismiss: function () {
                setIsConfirming(false);
              },
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        } catch (sdkError) {
          console.warn("Falling back to embedded Test Mode popup:", sdkError);
        }
      }

      // Open interactive Test Mode Checkout Popup
      setIsRazorpayModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during confirmation.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSimulatePayment = () => {
    setIsConfirming(true);
    setTimeout(async () => {
      setIsConfirming(false);
      setSimulatedSuccess(true);

      const paymentPayload = {
        orderId: order.id,
        razorpay_order_id: razorpayConfig?.order_id || order.razorpayOrderId || `order_${order.id}`,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: `sig_test_${Date.now().toString(36)}`,
      };

      setTimeout(() => {
        verifyPaymentAndRedirect(paymentPayload);
      }, 1000);
    }, 1000);
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
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  {order.status}
                </span>
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
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Itemized Line Items (Price Snapshotted)
            </h4>

            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-3 flex flex-col gap-1.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                        {item.product?.category || "Product"}
                      </span>
                      {item.isUpsell && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI Upsell Pairing</span>
                        </span>
                      )}
                    </div>
                    <h5 className="font-semibold text-xs text-zinc-100 mt-0.5">
                      {item.product?.name || "Verified Product"}
                    </h5>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white whitespace-nowrap block">
                      ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                    </span>
                  </div>
                </div>

                {item.reason && (
                  <p className="text-[11px] text-zinc-400 italic bg-zinc-950/60 rounded px-2 py-1 border border-zinc-800/60">
                    💡 &ldquo;{item.reason}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 rounded-xl bg-zinc-900/80 border border-zinc-800 p-3.5 text-xs text-zinc-300 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                ₹{order.subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Delivery</span>
              <span className="text-emerald-400 font-medium">Free Express Delivery</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total Amount</span>
              <span className="text-base text-indigo-400 font-extrabold">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Explicit Confirmation Gate Security Notice */}
          <div className="mb-5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900 border border-indigo-500/30 p-3 flex items-start gap-2.5 text-xs text-indigo-200">
            <Lock className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                Human Confirmation Gate Enforced
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                The AI sales agent is structurally prohibited from charging funds or authorizing payment. Manual human click is strictly required to open the payment gateway.
              </p>
            </div>
          </div>

          {/* The Confirmation Gate Button */}
          <Button
            onClick={handleConfirmGate}
            disabled={isConfirming}
            className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Unlocking Confirmation Gate...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Confirm ₹{order.totalAmount.toLocaleString("en-IN")} Payment</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Embedded Razorpay Test Mode Checkout Modal */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setIsRazorpayModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/40 bg-zinc-950 p-6 shadow-2xl text-zinc-100 animate-in zoom-in-95 duration-200">
            {/* Razorpay Test Mode Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Razorpay Test Checkout</h4>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">
                    Test Mode Sandbox
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {simulatedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-white">Payment Authorized!</h4>
                <p className="text-xs text-zinc-400">
                  Signature verified. Recording payment and updating order state...
                </p>
              </div>
            ) : (
              <div className="my-4 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-zinc-900/90 border border-zinc-800 p-3 text-xs">
                  <span className="text-zinc-400">Paying FlowCommerce:</span>
                  <span className="font-bold text-sm text-white font-mono">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs">
                  <button
                    onClick={() => setActiveTab("card")}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                      activeTab === "card"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Test Card
                  </button>
                  <button
                    onClick={() => setActiveTab("upi")}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                      activeTab === "upi"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    UPI / QR
                  </button>
                </div>

                {activeTab === "card" ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                      <div className="text-zinc-500 text-[10px]">Test Card Number</div>
                      <div>4111 2222 3333 4444</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">Expiry</span>
                        12/28
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
                        <span className="text-zinc-500 text-[10px] block">CVV</span>
                        123
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-center text-xs space-y-1">
                    <p className="font-mono text-zinc-300 font-semibold">success@razorpay</p>
                    <p className="text-[11px] text-zinc-500">Instant test mode simulation</p>
                  </div>
                )}

                <Button
                  onClick={handleSimulatePayment}
                  disabled={isConfirming}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>Pay ₹{order.totalAmount.toLocaleString("en-IN")} (Test Mode)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
