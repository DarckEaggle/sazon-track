"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  authId?: string;
}) {
  try {
    // 1. Create or find customer
    let customer;
    
    if (data.authId) {
      customer = await prisma.customer.findUnique({
        where: { authId: data.authId }
      });
      
      if (customer) {
        // Optionally update existing customer's info
        customer = await prisma.customer.update({
          where: { authId: data.authId },
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            address: data.deliveryAddress,
          }
        });
      }
    }
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          authId: data.authId,
          name: data.customerName || "Cliente Web",
          phone: data.customerPhone || "000000000",
          address: data.deliveryAddress,
        }
      });
    }

    // 2. Generate a unique tracking code (SAZ-XXX)
    const orderCount = await prisma.order.count();
    const trackingCode = `SAZ-${String(orderCount + 1).padStart(3, '0')}`;

    // 3. Create the Order with Items
    const order = await prisma.order.create({
      data: {
        trackingCode,
        totalAmount: data.totalAmount,
        status: "PENDING",
        customerId: customer.id,
        notes: data.notes,
        deliveryAddress: data.deliveryAddress,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    revalidatePath("/admin");
    return { success: true, trackingCode: order.trackingCode };
  } catch (error) {
    console.error("Checkout Error:", error);
    return { success: false, error: "Failed to process checkout" };
  }
}

export async function getCustomerProfile(authId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { authId }
    });
    return { success: true, customer };
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return { success: false, error: "Failed to fetch customer profile" };
  }
}
