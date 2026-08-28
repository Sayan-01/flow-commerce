import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
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

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
