"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, CreditCard, AlertTriangle, Lock, ArrowRight, Loader2 } from "lucide-react";
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
  const { data: session } = useSession();
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
          name: session?.user?.name || "Customer",
          email: session?.user?.email || "shopper@flow-commerce.ai",
          contact: "9999999999",
        },
        theme: {
          color: "#10b981",
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
        className="fixed inset-0 bg-black/70 transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl rounded-lg border border-[#232326] bg-[#111113] p-5 animate-in zoom-in-95 duration-200 text-[#F2F1ED]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#232326]">
            <div>
              <h3 className="font-medium text-[15px] text-[#F2F1ED]">Confirm your order</h3>
              <p className="text-xs text-[#7C7C82] mt-1">
                Order #{order.id.slice(-8)} · <span className="text-emerald-500">{order.status}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#7C7C82] hover:bg-[#1B1B1E] hover:text-[#F2F1ED] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="my-4 rounded-md bg-[#2A1917] border border-[#4A2B26] p-3 text-xs text-[#E0A29A] flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 shrink-0"
                strokeWidth={1.5}
              />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Itemized Line Items List */}
          <div className="my-5 space-y-5 max-h-64 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#232326] bg-[#151517] p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#7C7C82]">{item.product?.category || "Product"}</span>
                      {item.isUpsell && <span className="text-[10px] text-[#B99B5C]">AI pairing</span>}
                    </div>
                    <h5 className="font-medium text-[13px] text-[#F2F1ED] leading-snug">{item.product?.name || "Verified Product"}</h5>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[13px] font-medium text-[#F2F1ED] whitespace-nowrap block">₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}</span>
                    <span className="text-[11px] text-[#7C7C82]">
                      ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                    </span>
                  </div>
                </div>

                {item.reason && <p className="text-[11px] text-[#8C8C92] italic leading-relaxed">{item.reason}</p>}
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 rounded-lg border border-[#232326] bg-[#141416] p-3.5 text-xs text-[#8C8C92] mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#D8D8D4]">₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-[#7FA88F]">Free</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-[#F2F1ED] pt-2.5 border-t border-[#1E1E21]">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-5 flex items-start gap-2.5 text-xs text-[#8C8C92]">
            <Lock
              className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#7C7C82]"
              strokeWidth={1.5}
            />
            <p className="leading-relaxed">Confirming opens the official Razorpay checkout for UPI, cards, or net banking. Your payment details never touch our servers.</p>
          </div>

          {/* The Payment Action Button */}
          <Button
            onClick={handlePay}
            disabled={isConfirming}
            className="w-full bg-emerald-500 hover:bg-emerald-700 text-[#14120C] font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Opening Razorpay…</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Pay ₹{order.totalAmount.toLocaleString("en-IN")}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
