"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRiders() {
  try {
    const riders = await prisma.staff.findMany({
      where: { role: "RIDER" },
      select: {
        id: true,
        name: true,
        vehicle: true,
      }
    });
    return { success: true, riders };
  } catch (error) {
    console.error("Error fetching riders:", error);
    return { success: false, error: "Failed to fetch riders" };
  }
}

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany();
    return { success: true, staff };
  } catch (error) {
    return { success: false, error: "Failed to fetch staff" };
  }
}
