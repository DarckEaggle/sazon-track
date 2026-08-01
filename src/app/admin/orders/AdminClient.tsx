"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { CheckCircle2, AlertTriangle, ChevronRight, Loader2, MapPin, MessageSquare, Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/orders";

type OrderWithRelations = {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  createdAt: Date;
  notes: string | null;
  deliveryAddress: string | null;
  customer: { name: string; phone: string | null };
  rider?: { id: string; name: string } | null;
  items: {
    quantity: number;
    price: number;
    product: { name: string };
  }[];
};

export function AdminClient({ initialOrders, riders }: { initialOrders: OrderWithRelations[], riders: any[] }) {
  // We use optimistic updates or just wait for Server Action revalidation
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});

  const getStatusColor = (status: OrderStatus, createdAt: Date) => {
    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
    const isDelayed = elapsedMinutes > 30 && status !== "DELIVERED"; // Basic delay logic
    return isDelayed ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  };

  const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const sequence: OrderStatus[] = ["PENDING", "CONFIRMED", "IN_KITCHEN", "ON_THE_WAY", "DELIVERED"];
    const nextIdx = sequence.indexOf(currentStatus) + 1;
    
    if (nextIdx < sequence.length) {
      const newStatus = sequence[nextIdx];
      
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      startTransition(async () => {
        const riderId = newStatus === "ON_THE_WAY" ? selectedRiders[orderId] : undefined;
        await updateOrderStatus(orderId, newStatus, riderId);
      });
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="grid gap-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 text-foreground/50">No hay pedidos activos.</div>
      ) : (
        orders.map((order) => {
          const elapsedMinutes = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
          const isDelayed = elapsedMinutes > 30 && order.status !== "DELIVERED";
          const isExpanded = expandedOrderId === order.id;

          return (
            <div key={order.id} className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                  <div className={`p-3 rounded-full border shrink-0 ${getStatusColor(order.status, order.createdAt)}`}>
                    {isDelayed ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{order.trackingCode} - {order.customer.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mt-1">
                      <span>{elapsedMinutes} min transcurridos</span>
                      <span>•</span>
                      <span className="font-medium text-brand-orange">{order.status}</span>
                    </div>
                  </div>
                  <button className="md:hidden ml-auto p-2 text-foreground/50 hover:bg-foreground/5 rounded-full">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                <div className="flex gap-2 justify-between md:justify-end items-center">
                  <button 
                    onClick={() => toggleExpand(order.id)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground font-medium rounded-xl hover:bg-foreground/10 transition-colors"
                  >
                    Ver Detalles
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {order.status === "IN_KITCHEN" && (
                    <select
                      className="px-3 py-2 bg-background border border-foreground/10 rounded-xl text-sm"
                      value={selectedRiders[order.id] || ""}
                      onChange={(e) => setSelectedRiders({ ...selectedRiders, [order.id]: e.target.value })}
                    >
                      <option value="" disabled>Seleccionar Motorizado...</option>
                      {riders.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                  {order.status !== "DELIVERED" && (
                    <button 
                      onClick={() => advanceStatus(order.id, order.status)}
                      disabled={isPending || (order.status === "IN_KITCHEN" && !selectedRiders[order.id])}
                      className="flex items-center gap-2 px-6 py-2 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isPending ? <Loader2 size={18} className="animate-spin" /> : "Avanzar"}
                      {!isPending && <ChevronRight size={18} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Details Panel */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-foreground/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="font-bold flex items-center gap-2 text-brand-red">
                      <Utensils size={18} /> Pedido
                    </h4>
                    <ul className="space-y-2">
                      {order.items?.map((item, i) => (
                        <li key={i} className="flex justify-between items-start text-sm">
                          <div>
                            <span className="font-bold mr-2">{item.quantity}x</span>
                            <span>{item.product?.name}</span>
                          </div>
                          <span className="font-medium text-foreground/60">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-brand-red">
                        <MapPin size={18} /> Dirección de Entrega
                      </h4>
                      <p className="text-sm bg-foreground/5 p-3 rounded-xl border border-foreground/10">
                        {order.deliveryAddress || <span className="italic text-foreground/50">No especificada. Retiro en tienda o llamar al {order.customer.phone}.</span>}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold flex items-center gap-2 text-brand-orange">
                        <MessageSquare size={18} /> Notas del Cliente
                      </h4>
                      <p className="text-sm bg-foreground/5 p-3 rounded-xl border border-foreground/10 text-brand-orange/80">
                        {order.notes || <span className="italic text-foreground/50">Sin notas adicionales.</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
