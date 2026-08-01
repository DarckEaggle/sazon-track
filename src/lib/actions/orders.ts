"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getActiveOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: "DELIVERED"
        }
      },
      include: {
        customer: true,
        rider: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getOrder(trackingCode: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { trackingCode },
      include: {
        customer: true,
        rider: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus, riderId?: string) {
  try {
    let updateData: any = { status };

    if (status === "ON_THE_WAY" && riderId) {
      updateData.riderId = riderId;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });
    
    // Create a notification for the customer if they have an authId
    const customer = await prisma.customer.findUnique({ where: { id: order.customerId } });
    
    if (customer && customer.authId) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: "¡Tu pedido ha sido confirmado y está siendo procesado!",
        IN_KITCHEN: "Tu pedido está en cocina. ¡Nuestros chefs están preparándolo!",
        ON_THE_WAY: "¡Tu pedido está en camino! Nuestro repartidor ya salió.",
        DELIVERED: "Tu pedido ha sido entregado. ¡Que lo disfrutes!",
      };
      
      const message = statusMessages[status];
      
      if (message) {
        await prisma.notification.create({
          data: {
            title: `Actualización de pedido #${order.trackingCode}`,
            message,
            customerId: customer.id,
            orderId: order.trackingCode,
          }
        });
        
        // If delivered, additionally send the rate products notification
        if (status === "DELIVERED") {
          await prisma.notification.create({
            data: {
              title: `¡Califica tu pedido! 🍽️`,
              message: `Haz clic aquí para darnos tu opinión sobre los platos del pedido #${order.trackingCode}.`,
              customerId: customer.id,
              orderId: order.trackingCode,
              type: "RATE_ORDER"
            }
          });
        }
      }
    }

    revalidatePath("/admin");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function getUserOrders(authId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          authId: authId
        }
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: "Failed to fetch user orders" };
  }
}

export async function rateRider(orderId: string, score: number) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { feedbackScore: score }
    });
    return { success: true };
  } catch (error) {
    console.error("Error rating rider:", error);
    return { success: false, error: "Failed to submit rating" };
  }
}

export async function rateOrderItems(ratings: { id: string, rating: number }[]) {
  try {
    await prisma.$transaction(
      ratings.map(r => prisma.orderItem.update({
        where: { id: r.id },
        data: { rating: r.rating }
      }))
    );
    return { success: true };
  } catch (error) {
    console.error("Error rating items:", error);
    return { success: false, error: "Failed to submit item ratings" };
  }
}
