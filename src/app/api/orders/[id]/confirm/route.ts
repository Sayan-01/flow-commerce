import { NextRequest, NextResponse } from "next/server";
import { confirmOrderGate } from "@/lib/orders";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await confirmOrderGate(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          rejectedProductId: result.rejectedProductId,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      razorpayConfig: result.razorpayConfig,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error in confirmation gate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm order" },
      { status: 500 }
    );
  }
}
