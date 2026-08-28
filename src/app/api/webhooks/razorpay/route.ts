import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (
      webhookSecret &&
      !webhookSecret.includes("placeholder") &&
      signature
    ) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Invalid Razorpay webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!event) {
      return NextResponse.json({ error: "Missing event in webhook" }, { status: 400 });
    }

    // 1. Handle payment.captured
    if (event === "payment.captured") {
      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
          include: { items: true },
        });

        if (order) {
          // Decrement stock if not already paid
          if (order.status !== "PAID") {
            for (const item of order.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            }

            await prisma.order.update({
              where: { id: order.id },
              data: { status: "PAID" },
            });
          }

          // Upsert Payment
          await prisma.payment.upsert({
            where: { orderId: order.id },
            update: {
              status: "CAPTURED",
              razorpayPaymentId,
              rawResponse: payload,
            },
            create: {
              orderId: order.id,
              razorpayOrderId,
              razorpayPaymentId,
              amount: order.totalAmount,
              currency: order.currency || "INR",
              status: "CAPTURED",
              provider: "RAZORPAY",
              rawResponse: payload,
            },
          });

          // Log Audit Trail
          await prisma.auditLog.create({
            data: {
              actor: "SYSTEM",
              merchantId: order.merchantId,
              action: "WEBHOOK_PAYMENT_CAPTURED",
              entityType: "PAYMENT",
              entityId: order.id,
              payload: JSON.stringify({ event, razorpayOrderId, razorpayPaymentId }),
              status: "SUCCESS",
              reason: `Webhook confirmed payment.captured for Order #${order.id.slice(-6)}`,
            },
          });
        }
      }
    }

    // 2. Handle payment.failed
    if (event === "payment.failed") {
      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (order) {
          await prisma.payment.upsert({
            where: { orderId: order.id },
            update: {
              status: "FAILED",
              razorpayPaymentId,
              rawResponse: payload,
            },
            create: {
              orderId: order.id,
              razorpayOrderId,
              razorpayPaymentId,
              amount: order.totalAmount,
              currency: order.currency || "INR",
              status: "FAILED",
              provider: "RAZORPAY",
              rawResponse: payload,
            },
          });

          await prisma.auditLog.create({
            data: {
              actor: "SYSTEM",
              merchantId: order.merchantId,
              action: "WEBHOOK_PAYMENT_FAILED",
              entityType: "PAYMENT",
              entityId: order.id,
              payload: JSON.stringify({ event, razorpayOrderId, razorpayPaymentId }),
              status: "FAILED",
              reason: `Webhook reported payment.failed for Order #${order.id.slice(-6)}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, status: "processed" });
  } catch (error: any) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
