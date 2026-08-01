"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Gets the default rider (for demo purposes if needed, though now we assign specifically)
 */
async function getDefaultRider() {
  const rider = await prisma.staff.findFirst({
    where: { role: "RIDER" }
  });
  return rider;
}

/**
 * Gets orders assigned to a rider that are ON_THE_WAY
 */
export async function getRiderOrders(riderId?: string) {
  try {
    const rider = riderId 
      ? await prisma.staff.findUnique({ where: { id: riderId } })
      : await getDefaultRider();

    if (!rider) {
      return { success: false, error: "No hay motorizados registrados en el sistema." };
    }

    const orders = await prisma.order.findMany({
      where: {
        riderId: rider.id,
        status: { in: ["ON_THE_WAY", "DELIVERED"] },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          }
        }
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    return { success: true, orders, rider };
  } catch (error) {
    console.error("Error fetching rider orders:", error);
    return { success: false, error: "Error al cargar los pedidos del motorizado." };
  }
}

/**
 * Updates an order's status to DELIVERED
 */
export async function markOrderAsDelivered(orderId: string, providedRiderId?: string) {
  try {
    let riderId = providedRiderId;
    
    if (!riderId) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("staff_session");
      if (sessionCookie) {
        try {
          const session = JSON.parse(sessionCookie.value);
          if (session.role === "RIDER") {
            riderId = session.id;
          }
        } catch (e) {
          console.error("Invalid session cookie in action", e);
        }
      }
    }

    const rider = riderId 
      ? await prisma.staff.findUnique({ where: { id: riderId } })
      : await getDefaultRider();

    if (!rider) {
      return { success: false, error: "No autorizado." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    if (order.riderId !== rider.id) {
      return { success: false, error: "Este pedido no te pertenece." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    });

    // Create standard delivery notification for customer
    await prisma.notification.create({
      data: {
        title: `Actualización de pedido #${order.trackingCode}`,
        message: `Tu pedido ha sido entregado. ¡Que lo disfrutes!`,
        customerId: order.customerId,
        orderId: order.trackingCode,
      }
    });

    // Create additional notification to rate the order products
    await prisma.notification.create({
      data: {
        title: `¡Califica tu pedido! 🍽️`,
        message: `Haz clic aquí para darnos tu opinión sobre los platos del pedido #${order.trackingCode}.`,
        customerId: order.customerId,
        orderId: order.trackingCode,
        type: "RATE_ORDER"
      }
    });

    revalidatePath("/rider");
    revalidatePath("/admin");
    revalidatePath(`/track/${order.trackingCode}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating order to delivered:", error);
    return { success: false, error: "Error al actualizar el estado del pedido." };
  }
}
