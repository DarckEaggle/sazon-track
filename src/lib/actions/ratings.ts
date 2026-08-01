"use server";

import { prisma } from "@/lib/prisma";

export async function getRatingsStats() {
  try {
    // 1. Get Top Products (average rating from OrderItem)
    const productRatings = await prisma.orderItem.groupBy({
      by: ['productId'],
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
      where: {
        rating: { not: null }
      },
      orderBy: {
        _avg: {
          rating: 'desc'
        }
      },
      take: 5
    });

    // Populate product details
    const topProducts = await Promise.all(
      productRatings.map(async (pr) => {
        const product = await prisma.product.findUnique({ where: { id: pr.productId } });
        return {
          id: pr.productId,
          name: product?.name || 'Producto Desconocido',
          category: product?.category || '',
          averageRating: pr._avg.rating || 0,
          totalRatings: pr._count.rating || 0
        };
      })
    );

    // 2. Get Top Riders (average feedbackScore from Order)
    const riderRatings = await prisma.order.groupBy({
      by: ['riderId'],
      _avg: {
        feedbackScore: true,
      },
      _count: {
        feedbackScore: true,
      },
      where: {
        feedbackScore: { not: null },
        riderId: { not: null }
      },
      orderBy: {
        _avg: {
          feedbackScore: 'desc'
        }
      },
      take: 5
    });

    // Populate rider details
    const topRiders = await Promise.all(
      riderRatings.map(async (rr) => {
        const rider = await prisma.staff.findUnique({ where: { id: rr.riderId! } });
        return {
          id: rr.riderId,
          name: rider?.name || 'Repartidor Desconocido',
          role: rider?.role || 'RIDER',
          averageRating: rr._avg.feedbackScore || 0,
          totalRatings: rr._count.feedbackScore || 0
        };
      })
    );

    return { success: true, topProducts, topRiders };
  } catch (error) {
    console.error("Error fetching ratings stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
