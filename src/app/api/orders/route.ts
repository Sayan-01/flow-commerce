import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderProposal } from "@/lib/orders";
import { auth } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { cartId, customerNote } = body;

    const result = await createOrderProposal({
      userId,
      cartId,
      customerNote,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          rejectedProductId: result.rejectedProductId,
          reason: result.reason,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: result.order,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order proposal:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order proposal" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const merchantId = searchParams.get("merchantId");
    const status = searchParams.get("status");

    const where: Record<string, any> = {};

    if (userId) {
      where.userId = userId;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
