import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const inStockOnly = searchParams.get("inStock") === "true";
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;

    const where: Record<string, any> = { isActive: true };

    if (inStockOnly) {
      where.stock = { gt: 0 };
    }

    if (category && category.trim()) {
      where.category = { contains: category.trim().replace(/s$/i, ""), mode: "insensitive" };
    }

    if (tag && tag.trim()) {
      where.tags = { has: tag.trim().toLowerCase() };
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      where.price = { lte: maxPrice };
    }

    if (query && query.trim()) {
      const words = query
        .replace(/(?:under|below|budget|less than)?\s*(?:₹|rs\.?|inr)?\s*[\d,]+(?:k|000)?/gi, " ")
        .replace(/[^\w\s-]/g, " ")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 1 && !/^(under|below|price|for|the|and|with|show|best)$/i.test(w));

      if (words.length > 0) {
        where.AND = words.map((w) => ({
          OR: [
            { name: { contains: w, mode: "insensitive" } },
            { description: { contains: w, mode: "insensitive" } },
            { tags: { has: w.toLowerCase() } },
          ],
        }));
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, tags = [], stock = 0, imageUrl, merchantId } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json({ success: false, error: "Product description is required" }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 });
    }

    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json({ success: false, error: "Stock must be a non-negative number" }, { status: 400 });
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
    }

    // Resolve or fallback to default merchant
    let targetMerchantId = merchantId;
    if (!targetMerchantId) {
      const defaultMerchant = await prisma.merchant.findFirst();
      if (!defaultMerchant) {
        return NextResponse.json(
          { success: false, error: "No merchant found. Please seed the database first." },
          { status: 400 }
        );
      }
      targetMerchantId = defaultMerchant.id;
    }

    const product = await prisma.product.create({
      data: {
        merchantId: targetMerchantId,
        name: name.trim(),
        description: description.trim(),
        price: Math.round(numericPrice),
        category: category.trim(),
        tags: Array.isArray(tags) ? tags.map((t: string) => t.trim().toLowerCase()) : [],
        stock: Math.round(numericStock),
        imageUrl: imageUrl || null,
        isActive: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        merchantId: targetMerchantId,
        actor: "MERCHANT",
        action: "PRODUCT_CREATED",
        entityType: "PRODUCT",
        entityId: product.id,
        payload: JSON.stringify({ name: product.name, price: product.price, stock: product.stock }),
        status: "SUCCESS",
        reason: `Product "${product.name}" created by merchant`,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
