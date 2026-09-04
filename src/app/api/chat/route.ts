import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAgentLoop } from "@/lib/agent/engine";
import { auth } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to chat." },
        { status: 401 }
      );
    }

    console.log("session user id: ", userId);

    const body = await request.json();
    const { messages = [] } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: "Messages array is required" }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1];

    // 1. Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { userId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId },
      });
    }

    // 2. Persist User Message to DB
    if (latestUserMessage && latestUserMessage.role === "user") {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: latestUserMessage.content,
        },
      });
    }

    // 3. Run LLM Tool-Calling Agent Loop
    const agentResult = await runAgentLoop({
      messages,
      userId,
    });

    // 4. Persist Assistant Message to DB
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: agentResult.reply,
        toolCalls: agentResult.toolExecutions.length > 0 ? (agentResult.toolExecutions as any) : undefined,
        toolResults: agentResult.toolExecutions.length > 0 ? (agentResult.toolExecutions.map((t) => t.result) as any) : undefined,
      },
    });

    // 5. Create Audit Log for agent interaction
    await prisma.auditLog.create({
      data: {
        actor: "AGENT",
        action: "CHAT_TURN_COMPLETED",
        entityType: "CONVERSATION",
        entityId: conversation.id,
        payload: JSON.stringify({
          query: latestUserMessage?.content,
          toolExecutionsCount: agentResult.toolExecutions.length,
          toolsUsed: agentResult.toolExecutions.map((t) => t.name),
        }),
        status: "SUCCESS",
        reason: `Completed conversational turn with ${agentResult.toolExecutions.length} tool executions`,
      },
    });

    // 6. Fetch latest active cart state & recommendations
    const cart = await prisma.cart.findUnique({
      where: { userId },
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
              },
            },
          },
        },
      },
    });

    let formattedCart = null;
    if (cart) {
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

      // Extract recommendations if executed in tools or fetch fresh
      const recExecution = agentResult.toolExecutions.find((t) => t.name === "getRecommendations");
      const recommendations = recExecution?.result?.recommendations || [];

      formattedCart = {
        id: cart.id,
        status: cart.status,
        itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        discount,
        totalAmount,
        items,
        recommendations,
      };
    }

    return NextResponse.json({
      success: true,
      userId,
      reply: agentResult.reply,
      toolExecutions: agentResult.toolExecutions,
      cart: formattedCart,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process chat message" }, { status: 500 });
  }
}
