import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, storeName: true, name: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error retrieving product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const dataToUpdate: Record<string, any> = {};

    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description.trim();
    if (body.category !== undefined) dataToUpdate.category = body.category.trim();
    if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p <= 0) {
        return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 });
      }
      dataToUpdate.price = Math.round(p);
    }

    if (body.stock !== undefined) {
      const s = Number(body.stock);
      if (isNaN(s) || s < 0) {
        return NextResponse.json({ success: false, error: "Stock must be a non-negative number" }, { status: 400 });
      }
      dataToUpdate.stock = Math.round(s);
    }

    if (body.tags !== undefined && Array.isArray(body.tags)) {
      dataToUpdate.tags = body.tags.map((t: string) => String(t).trim().toLowerCase());
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    // Create Audit Log for price or stock alteration
    await prisma.auditLog.create({
      data: {
        merchantId: existingProduct.merchantId,
        actor: "MERCHANT",
        action: "PRODUCT_UPDATED",
        entityType: "PRODUCT",
        entityId: id,
        payload: JSON.stringify({
          previous: { price: existingProduct.price, stock: existingProduct.stock },
          updated: dataToUpdate,
        }),
        status: "SUCCESS",
        reason: `Product "${updatedProduct.name}" updated`,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Soft delete / deactivate to prevent foreign key errors with existing orders
    const deactivated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        merchantId: existingProduct.merchantId,
        actor: "MERCHANT",
        action: "PRODUCT_DEACTIVATED",
        entityType: "PRODUCT",
        entityId: id,
        payload: JSON.stringify({ name: existingProduct.name }),
        status: "SUCCESS",
        reason: `Product "${existingProduct.name}" deactivated by merchant`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deactivated successfully",
      product: deactivated,
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
