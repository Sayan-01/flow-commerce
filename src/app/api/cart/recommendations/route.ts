import { NextRequest, NextResponse } from "next/server";
import { generateUpsellRecommendations } from "@/lib/agent/tools";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || "default_guest_session";
    const category = searchParams.get("category") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const recommendations = await generateUpsellRecommendations(sessionId, category, maxPrice);

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
