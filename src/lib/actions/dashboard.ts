"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    const totalOrders = await prisma.order.count();
    
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: "DELIVERED"
      }
    });

    const activeOrders = await prisma.order.count({
      where: {
        status: {
          not: "DELIVERED"
        }
      }
    });

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    return {
      success: true,
      metrics: {
        totalOrders,
        totalRevenue: revenue._sum.totalAmount || 0,
        activeOrders,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch metrics" };
  }
}
