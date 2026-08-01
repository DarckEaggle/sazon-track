"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";

export async function getUserNotifications(authId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { authId },
    });

    if (!customer) {
      return [];
    }

    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadNotificationsCount(authId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { authId },
    });

    if (!customer) return 0;

    const count = await prisma.notification.count({
      where: { 
        customerId: customer.id,
        read: false
      },
    });

    return count;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllNotificationsAsRead(authId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { authId },
    });

    if (!customer) return { success: false, error: "Customer not found" };

    await prisma.notification.updateMany({
      where: { 
        customerId: customer.id,
        read: false
      },
      data: { read: true },
    });
    
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}
