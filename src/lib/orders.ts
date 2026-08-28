import { prisma } from "@/lib/prisma";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export async function createOrderProposal({
  sessionId,
  cartId,
  customerNote,
}: {
  sessionId: string;
  cartId?: string;
  customerNote?: string;
}) {
  // 1. Fetch active cart
  const cart = await prisma.cart.findUnique({
    where: cartId ? { id: cartId } : { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return {
      success: false,
      error: "Cart is empty. Please add items to your cart before checking out.",
    };
  }

  // 2. Multi-Layer Guardrail Validation against PostgreSQL
  for (const item of cart.items) {
    const liveProduct = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!liveProduct || !liveProduct.isActive) {
      await prisma.auditLog.create({
        data: {
          actor: "SYSTEM",
          action: "GUARDRAIL_REJECT",
          entityType: "CART",
          entityId: cart.id,
          payload: JSON.stringify({
            productId: item.productId,
            reason: "PRODUCT_INACTIVE_OR_DELETED",
          }),
          status: "REJECTED",
          reason: `Product ${item.product.name} is inactive or deleted`,
        },
      });

      return {
        success: false,
        error: `Item "${item.product.name}" is no longer available in inventory.`,
        rejectedProductId: item.productId,
        reason: "INACTIVE",
      };
    }

    // Stock verification
    if (liveProduct.stock < item.quantity) {
      await prisma.auditLog.create({
        data: {
          actor: "SYSTEM",
          action: "GUARDRAIL_REJECT",
          entityType: "PRODUCT",
          entityId: liveProduct.id,
          payload: JSON.stringify({
            productId: liveProduct.id,
            productName: liveProduct.name,
            requestedQuantity: item.quantity,
            availableStock: liveProduct.stock,
            reason: "INSUFFICIENT_STOCK",
          }),
          status: "REJECTED",
          reason: `Insufficient inventory: requested ${item.quantity}, only ${liveProduct.stock} in stock`,
        },
      });

      return {
        success: false,
        error: `Insufficient stock for "${liveProduct.name}". Only ${liveProduct.stock} unit(s) left.`,
        rejectedProductId: liveProduct.id,
        availableStock: liveProduct.stock,
        reason: "INSUFFICIENT_STOCK",
      };
    }

    // Live Price Drift verification (detect price tampering)
    if (liveProduct.price !== item.priceAtAdd) {
      // Re-align to database truth
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { priceAtAdd: liveProduct.price },
      });

      await prisma.auditLog.create({
        data: {
          actor: "SYSTEM",
          action: "GUARDRAIL_PRICE_REALIGNED",
          entityType: "CART_ITEM",
          entityId: item.id,
          payload: JSON.stringify({
            previousPrice: item.priceAtAdd,
            verifiedDatabasePrice: liveProduct.price,
          }),
          status: "SUCCESS",
          reason: `Price realigned to verified PostgreSQL price for ${liveProduct.name}`,
        },
      });
    }
  }

  // 3. Compute Deterministic Totals
  const verifiedItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  const subtotal = verifiedItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const discount = 0;
  const totalAmount = subtotal - discount;

  // Resolve target merchant
  const firstMerchantId = verifiedItems[0]?.product?.merchantId;
  let merchantId = firstMerchantId;
  if (!merchantId) {
    const merchant = await prisma.merchant.findFirst();
    merchantId = merchant?.id || "default_merchant";
  }

  // 4. Create Razorpay Test Order
  const razorpayOrderId = await createRazorpayOrder({
    amountInPaise: totalAmount * 100,
    receipt: `rcpt_${Date.now().toString().slice(-8)}`,
  });

  // 5. Create Order & Permanently Snapshot Line Items
  const order = await prisma.order.create({
    data: {
      userId: cart.userId || null,
      merchantId,
      cartId: cart.id,
      status: "PROPOSED",
      subtotal,
      discount,
      totalAmount,
      currency: "INR",
      customerNote: customerNote || null,
      razorpayOrderId,
    },
  });

  // Check recommendations to link upsell metadata
  const recommendations = await prisma.recommendation.findMany({
    where: {
      cartId: cart.id,
      productId: { in: verifiedItems.map((v) => v.productId) },
    },
  });

  const recMap = new Map(recommendations.map((r) => [r.productId, r]));

  // Snapshot OrderItems
  for (const item of verifiedItems) {
    const rec = recMap.get(item.productId);
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price, // snapshotted
        isUpsell: !!rec,
        reason: rec?.reason || null,
      },
    });
  }

  // 6. Audit Log Proposal
  await prisma.auditLog.create({
    data: {
      actor: "SYSTEM",
      merchantId,
      action: "ORDER_PROPOSED",
      entityType: "ORDER",
      entityId: order.id,
      payload: JSON.stringify({
        orderId: order.id,
        itemCount: verifiedItems.length,
        totalAmount,
        razorpayOrderId,
      }),
      status: "SUCCESS",
      reason: `Proposed order #${order.id.slice(-6)} totaling ₹${totalAmount.toLocaleString("en-IN")}`,
    },
  });

  // Fetch full hydrated order
  const proposedOrder = await prisma.order.findUnique({
    where: { id: order.id },
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
    },
  });

  return {
    success: true,
    order: proposedOrder,
    message: `Order proposal created for ₹${totalAmount.toLocaleString("en-IN")}. Human confirmation gate required to initiate payment.`,
  };
}

// 7. Human-Only Confirmation Gate Execution
export async function confirmOrderGate(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.status !== "PROPOSED") {
    if (order.status === "AWAITING_PAYMENT") {
      return {
        success: true,
        order,
        razorpayConfig: getRazorpayClientConfig(order),
        message: "Order is already awaiting payment.",
      };
    }
    return {
      success: false,
      error: `Order cannot be confirmed because current status is ${order.status}.`,
    };
  }

  // Final Guardrail Check: re-verify stock before opening payment gateway
  for (const item of order.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product || product.stock < item.quantity) {
      await prisma.auditLog.create({
        data: {
          actor: "SYSTEM",
          action: "GUARDRAIL_REJECT",
          entityType: "ORDER",
          entityId: order.id,
          payload: JSON.stringify({
            productId: item.productId,
            name: item.product.name,
            reason: "STOCK_DEPLETED_BEFORE_CONFIRM",
          }),
          status: "REJECTED",
          reason: `Stock depleted for ${item.product.name} prior to confirmation gate`,
        },
      });

      return {
        success: false,
        error: `Sorry, "${item.product.name}" just went out of stock before payment.`,
        rejectedProductId: item.productId,
      };
    }
  }

  // Transition status to AWAITING_PAYMENT
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "AWAITING_PAYMENT" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  // Audit Log Confirmation Gate
  await prisma.auditLog.create({
    data: {
      actor: "USER",
      merchantId: order.merchantId,
      action: "CONFIRM_ORDER_GATE",
      entityType: "ORDER",
      entityId: order.id,
      payload: JSON.stringify({
        orderId: order.id,
        totalAmount: order.totalAmount,
        confirmedAt: new Date().toISOString(),
      }),
      status: "SUCCESS",
      reason: `Human user explicitly clicked 'Confirm ₹${order.totalAmount.toLocaleString("en-IN")} Payment'`,
    },
  });

  return {
    success: true,
    order: updatedOrder,
    razorpayConfig: getRazorpayClientConfig(updatedOrder),
    message: "Order confirmed by user. Razorpay payment gate unlocked.",
  };
}

// Razorpay Order Generator Helper (Supports live Razorpay API & test simulation)
async function createRazorpayOrder({
  amountInPaise,
  receipt,
}: {
  amountInPaise: number;
  receipt: string;
}): Promise<string> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    keyId &&
    keySecret &&
    !keyId.includes("placeholder") &&
    !keySecret.includes("placeholder")
  ) {
    try {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
      console.warn("Razorpay API returned status", res.status, await res.text());
    } catch (e) {
      console.error("Razorpay API error:", e);
    }
  }

  // Fallback test order ID for development and sandbox simulation
  return `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getRazorpayClientConfig(order: any) {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_flowcommerce";
  return {
    key: keyId.includes("placeholder") ? "rzp_test_flowcommerce" : keyId,
    amount: order.totalAmount * 100, // in paise
    currency: order.currency || "INR",
    name: "FlowCommerce",
    description: `Order #${order.id.slice(-6)} Payment`,
    order_id: order.razorpayOrderId,
    prefill: {
      name: order.user?.name || "Customer",
      email: order.user?.email || "shopper@flow-commerce.ai",
      contact: "9876543210",
    },
    theme: {
      color: "#4f46e5",
    },
  };
}
