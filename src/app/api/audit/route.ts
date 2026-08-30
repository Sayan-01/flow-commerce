import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const requestedMerchantId = searchParams.get("merchantId");
    const merchantId = session?.user?.id || requestedMerchantId || undefined;

    const actor = searchParams.get("actor");
    const action = searchParams.get("action");
    const status = searchParams.get("status");
    const search = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "100");

    // 1. Calculate AI-Attributed Revenue & Safety Analytics
    const paidOrdersWhere: Record<string, any> = { status: "PAID" };
    if (merchantId) {
      paidOrdersWhere.merchantId = merchantId;
    }

    const paidOrders = await prisma.order.findMany({
      where: paidOrdersWhere,
      include: {
        items: true,
      },
    });

    let totalGrossRevenue = 0;
    let aiAttributedUpsellRevenue = 0;
    let baselineRevenue = 0;
    let totalPaidOrdersCount = paidOrders.length;
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

    const totalRecommendations = await prisma.recommendation.count();
    const acceptedRecommendations = await prisma.recommendation.count({
      where: { accepted: true },
    });
    const recommendationConversionRate =
      totalRecommendations > 0
        ? Math.round((acceptedRecommendations / totalRecommendations) * 1000) / 10
        : 0;

    const guardrailBlocks = await prisma.auditLog.count({
      where: { action: "GUARDRAIL_REJECT" },
    });

    const totalAuditEvents = await prisma.auditLog.count();

    const metrics = {
      totalGrossRevenue,
      aiAttributedUpsellRevenue,
      baselineRevenue,
      aiRevenueLiftPercentage,
      totalPaidOrdersCount,
      paidUpsellItemsCount,
      totalRecommendations,
      acceptedRecommendations,
      recommendationConversionRate,
      guardrailBlocks,
      totalAuditEvents,
    };

    // 2. Fetch Filterable Audit Logs
    const auditWhere: Record<string, any> = {};

    if (merchantId) {
      auditWhere.merchantId = merchantId;
    }

    if (actor && actor !== "ALL") {
      auditWhere.actor = actor;
    }

    if (action && action !== "ALL") {
      auditWhere.action = { contains: action, mode: "insensitive" };
    }

    if (status && status !== "ALL") {
      auditWhere.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      auditWhere.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: auditWhere,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    // 3. Fetch Recent Orders List
    const ordersWhere: Record<string, any> = {};
    if (merchantId) {
      ordersWhere.merchantId = merchantId;
    }

    const orders = await prisma.order.findMany({
      where: ordersWhere,
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

    return NextResponse.json({
      success: true,
      metrics,
      logs,
      orders,
    });
  } catch (error: any) {
    console.error("Error in GET /api/audit:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit data" },
      { status: 500 }
    );
  }
}
