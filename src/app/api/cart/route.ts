import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeAgentTool, generateUpsellRecommendations } from "@/lib/agent/tools";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || "default_guest_session";

    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
          status: "ACTIVE",
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  category: true,
                  imageUrl: true,
                  description: true,
                },
              },
            },
          },
        },
      });
    }

    const items = cart.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.product.name,
      price: it.priceAtAdd,
      quantity: it.quantity,
      subtotal: it.priceAtAdd * it.quantity,
      stock: it.product.stock,
      category: it.product.category,
      imageUrl: it.product.imageUrl,
    }));

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const discount = 0;
    const totalAmount = subtotal - discount;

    // Fetch existing or generate recommendations only if cart has items
    let recommendations: any[] = [];
    if (cart.items.length > 0) {
      recommendations = await generateUpsellRecommendations(sessionId);
    }

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        status: cart.status,
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        discount,
        totalAmount,
        items,
        recommendations,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, quantity = 1, sessionId: requestedSessionId, removeAll = true } = body;

    const sessionId = requestedSessionId || "default_guest_session";

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required ('add', 'update', 'remove', 'clear')" }, { status: 400 });
    }

    let toolResult: any;

    if (action === "add") {
      if (!productId) return NextResponse.json({ success: false, error: "productId is required for add" }, { status: 400 });
      toolResult = await executeAgentTool("addToCart", { productId, quantity, sessionId }, { sessionId });
    } else if (action === "update") {
      if (!productId) return NextResponse.json({ success: false, error: "productId is required for update" }, { status: 400 });
      toolResult = await executeAgentTool("updateCartQuantity", { productId, quantity, sessionId }, { sessionId });
    } else if (action === "remove") {
      if (!productId) return NextResponse.json({ success: false, error: "productId is required for remove" }, { status: 400 });
      toolResult = await executeAgentTool("removeFromCart", { productId, sessionId, removeAll }, { sessionId });
    } else if (action === "clear") {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
      toolResult = { success: true, message: "Cart cleared" };
    } else {
      return NextResponse.json({ success: false, error: `Unsupported action "${action}"` }, { status: 400 });
    }

    if (!toolResult.success) {
      return NextResponse.json({ success: false, error: toolResult.error }, { status: 400 });
    }

    // Return refreshed cart
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true,
                description: true,
              },
            },
          },
        },
      },
    });

    const items = cart?.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.product.name,
      price: it.priceAtAdd,
      quantity: it.quantity,
      subtotal: it.priceAtAdd * it.quantity,
      stock: it.product.stock,
      category: it.product.category,
      imageUrl: it.product.imageUrl,
    })) || [];

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const discount = 0;
    const totalAmount = subtotal - discount;
    const recommendations = await generateUpsellRecommendations(sessionId);

    return NextResponse.json({
      success: true,
      message: toolResult.message,
      cart: {
        id: cart?.id,
        status: cart?.status || "ACTIVE",
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        discount,
        totalAmount,
        items,
        recommendations,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to modify cart" },
      { status: 500 }
    );
  }
}
