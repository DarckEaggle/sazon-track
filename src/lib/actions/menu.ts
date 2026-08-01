"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategoriesWithProducts() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: "Failed to fetch menu" };
  }
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive }
    });
    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function saveProduct(data: any) {
  try {
    if (data.id) {
      await prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
        }
      });
    } else {
      await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
        }
      });
    }
    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to save product" };
  }
}
