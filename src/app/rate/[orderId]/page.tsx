import { getOrder } from "@/lib/actions/orders";
import { notFound } from "next/navigation";
import { RateClient } from "./RateClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function RateOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  const { order, success } = await getOrder(resolvedParams.orderId);

  if (!success || !order) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-foreground/10 px-4 py-4 flex items-center shadow-sm">
        <Link href="/notifications" className="p-2 -ml-2 rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-brand-red transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold ml-2">Calificar Pedido #{order.trackingCode}</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <div className="text-center my-6">
          <h2 className="text-2xl font-bold mb-2">¡Gracias por preferirnos!</h2>
          <p className="text-foreground/70">¿Qué te parecieron los platos que ordenaste?</p>
        </div>
        
        <RateClient order={order as any} />
      </div>
    </div>
  );
}
