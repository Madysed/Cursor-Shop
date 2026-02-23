import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Set dynamic config
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { images, ...productData } = json;

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...productData,
        images: images || [],
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use a transaction to ensure all related operations complete or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Delete cart items that reference this product
      await tx.cartItem.deleteMany({
        where: { productId: params.id },
      });

      // 2. Handle OrderItems
      // This is more complex because orders need to be preserved
      // For now, we'll check if the product has order references
      const orderItemsCount = await tx.orderItem.count({
        where: { productId: params.id },
      });

      if (orderItemsCount > 0) {
        console.log(`Product with ID ${params.id} has ${orderItemsCount} order items.`);
        
        // Important: If you're unable to delete products with order history,
        // you should consider adding a 'deleted' flag to the Product model rather than 
        // physically deleting the product.
        
        // For this immediate fix, we'll delete the orderItems, but in a real
        // production system you might want to mark products as deleted instead.
        await tx.orderItem.deleteMany({
          where: { productId: params.id },
        });
      }

      // 3. Delete reviews for this product
      await tx.review.deleteMany({
        where: { productId: params.id },
      });

      // 4. Finally delete the product
      await tx.product.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ 
      success: true,
      message: "Product and all related data successfully deleted" 
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { 
        error: "Error deleting product. Details: " + (error instanceof Error ? error.message : String(error)),
        hint: "If the product has order history, consider implementing a 'soft delete' approach instead."
      },
      { status: 500 }
    );
  }
} 