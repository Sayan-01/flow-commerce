import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { AuditDashboard } from "@/components/merchant/audit/audit-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit & AI Revenue — FlowCommerce Merchant",
  description: "Reconciled ledger, bounded guardrails audit trail, and explainable AI-attributed revenue analytics.",
};

export default async function MerchantAuditPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "MERCHANT") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            🛡️
          </div>
          <h1 className="text-xl font-bold text-white">Merchant Access Required</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please log in with a verified Merchant account to access your store&apos;s live audit trail, guardrails log, and AI-attributed revenue ledger.
          </p>
        </div>
      </div>
    );
  }

  const merchantId = session.user.id;

  // 1. Calculate Scoped Metrics on Server for this Merchant
  const paidOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      merchantId,
    },
    include: { items: true },
  });

  let totalGrossRevenue = 0;
  let aiAttributedUpsellRevenue = 0;
  let baselineRevenue = 0;
  let paidUpsellItemsCount = 0;

  for (const order of paidOrders) {
    totalGrossRevenue += order.totalAmount;
    for (const item of order.items) {
      if (item.isUpsell) {
        aiAttributedUpsellRevenue += item.unitPrice * item.quantity;
        paidUpsellItemsCount += item.quantity;
      } else {
        baselineRevenue += item.unitPrice * item.quantity;
      }
    }
  }

  const aiRevenueLiftPercentage =
    totalGrossRevenue > 0
      ? Math.round((aiAttributedUpsellRevenue / totalGrossRevenue) * 1000) / 10
      : 0;

  const totalRecommendations = await prisma.recommendation.count({
    where: {
      product: { merchantId },
    },
  });

  const acceptedRecommendations = await prisma.recommendation.count({
    where: {
      accepted: true,
      product: { merchantId },
    },
  });

  const recommendationConversionRate =
    totalRecommendations > 0
      ? Math.round((acceptedRecommendations / totalRecommendations) * 1000) / 10
      : 0;

  const guardrailBlocks = await prisma.auditLog.count({
    where: {
      action: "GUARDRAIL_REJECT",
      merchantId,
    },
  });

  const totalAuditEvents = await prisma.auditLog.count({
    where: { merchantId },
  });

  const initialMetrics = {
    totalGrossRevenue,
    aiAttributedUpsellRevenue,
    baselineRevenue,
    aiRevenueLiftPercentage,
    totalPaidOrdersCount: paidOrders.length,
    paidUpsellItemsCount,
    totalRecommendations,
    acceptedRecommendations,
    recommendationConversionRate,
    guardrailBlocks,
    totalAuditEvents,
  };

  // 2. Fetch Initial Scoped Audit Logs for this Merchant
  const initialLogs = await prisma.auditLog.findMany({
    where: {
      merchantId,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // 3. Fetch Initial Scoped Orders for this Merchant
  const initialOrders = await prisma.order.findMany({
    where: {
      merchantId,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
              imageUrl: true,
            },
          },
        },
      },
      merchant: {
        select: { id: true, name: true, storeName: true },
      },
      payments: true,
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AuditDashboard
          initialMetrics={initialMetrics}
          initialLogs={initialLogs as any}
          initialOrders={initialOrders as any}
        />
      </div>
    </div>
  );
}
