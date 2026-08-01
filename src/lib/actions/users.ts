"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveStaff(data: any) {
  try {
    if (data.id) {
      await prisma.staff.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          password: data.password, // In a real app this should be hashed
          role: data.role,
          phone: data.phone,
          vehicle: data.vehicle,
        }
      });
    } else {
      await prisma.staff.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password, // In a real app this should be hashed
          role: data.role,
          phone: data.phone,
          vehicle: data.vehicle,
        }
      });
    }
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save user" };
  }
}

export async function deleteStaff(id: string) {
  try {
    await prisma.staff.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user. Maybe they have orders assigned?" };
  }
}
