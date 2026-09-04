import { NextRequest, NextResponse } from "next/server";
import { generateUpsellRecommendations } from "@/lib/agent/tools";
import { auth } from "../../../../../auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const recommendations = await generateUpsellRecommendations(userId, category, maxPrice);

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    console.error("Error in GET /api/cart/recommendations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
