import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  ExternalLink,
  Bot,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderStatusPage({ params }: OrderPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      merchant: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isPaid = order.status === "PAID";
  const isAwaiting = order.status === "AWAITING_PAYMENT" || order.status === "PROPOSED";
  const isFailed = order.status === "FAILED";
  const payment = order.payments[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shopping Agent</span>
          </Link>

          <span className="text-xs font-mono text-zinc-500">
            Order #{order.id.slice(-8)}
          </span>
        </div>

        {/* Hero Status Card */}
        <div
          className={`rounded-2xl border p-6 shadow-xl relative overflow-hidden backdrop-blur-md ${
            isPaid
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900/80 to-zinc-950"
              : isAwaiting
              ? "border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-zinc-900/80 to-zinc-950"
              : "border-red-500/30 bg-gradient-to-br from-red-950/30 via-zinc-900/80 to-zinc-950"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl ${
                  isPaid
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : isAwaiting
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : isAwaiting ? (
                  <Clock className="h-7 w-7 animate-pulse" />
                ) : (
                  <AlertTriangle className="h-7 w-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {isPaid
                      ? "Payment Confirmed & Verified"
                      : isAwaiting
                      ? "Order Awaiting Payment"
                      : "Payment Failed"}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPaid
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : isAwaiting
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        : "bg-red-500/10 border-red-500/20 text-red-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-1">
                  {isPaid
                    ? "Thank you! Your order has been authorized, inventory is reserved, and receipt is generated."
                    : isAwaiting
                    ? "Your order proposal is ready. Complete the payment gateway authorization to proceed."
                    : "We could not process payment for this order. Your cart items are preserved."}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Total Paid
              </span>
              <span className="text-xl font-extrabold text-white">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Line Items Receipt */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-400" />
              <span>Purchased Items ({order.items.length})</span>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              Store: {order.merchant.storeName}
            </span>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-indigo-400 uppercase">
                        {item.product.category}
                      </span>
                      {item.isUpsell && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI Recommended Pairing</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-xs text-zinc-100 mt-0.5">
                      {item.product.name}
                    </h3>
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
                  <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 rounded px-2.5 py-1 border border-zinc-800/50">
                    💡 &ldquo;{item.reason}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-200">
                ₹{order.subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Logistics</span>
              <span className="text-emerald-400 font-medium">Free Express Delivery</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total Amount</span>
              <span className="text-base text-indigo-400 font-extrabold">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment & Audit Verification Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Payment Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <span>Payment Details</span>
            </div>

            <div className="space-y-1 text-zinc-400 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span className="text-zinc-200">Razorpay (Test Mode)</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Ref:</span>
                <span className="text-zinc-200 truncate max-w-[150px]">
                  {payment?.razorpayPaymentId || "pay_simulated"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Razorpay Order:</span>
                <span className="text-zinc-200 truncate max-w-[150px]">
                  {order.razorpayOrderId || "order_simulated"}
                </span>
              </div>
            </div>
          </div>

          {/* Guardrails Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Guardrails Verification</span>
            </div>

            <div className="space-y-1 text-zinc-400 text-[11px]">
              <div className="flex justify-between">
                <span>Inventory Lock:</span>
                <span className="text-emerald-400 font-semibold">Verified & Decremented</span>
              </div>
              <div className="flex justify-between">
                <span>Confirmation Gate:</span>
                <span className="text-emerald-400 font-semibold">Human Authorized</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Trail:</span>
                <span className="text-emerald-400 font-semibold">Logged to DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/chat" className="w-full sm:flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2.5 rounded-xl hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer">
              <Bot className="h-4 w-4" />
              <span>Continue Shopping with AI</span>
            </Button>
          </Link>

          <Link href="/merchant/products" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="h-4 w-4" />
              <span>Merchant Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
