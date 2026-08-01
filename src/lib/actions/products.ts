"use server";

import { prisma } from "../prisma";

export async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true }
  });
}

export async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true }
  });
}
