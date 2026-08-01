"use client";

import { useState } from "react";
import { markOrderAsDelivered } from "@/lib/actions/rider";
import { MapPin, Phone, User, CheckCircle2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapMock } from "@/components/MapMock";

export function RiderClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [mapOpenFor, setMapOpenFor] = useState<string | null>(null);

  const handleDeliver = async (orderId: string) => {
    setUpdating(orderId);
    try {
      const res = await markOrderAsDelivered(orderId);
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "DELIVERED" } : o));
      } else {
        alert(res.error || "Error al entregar pedido");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === "ON_THE_WAY");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

  return (
    <div className="flex flex-col gap-10">
      
      {/* PENDING SECTION */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-background p-4 rounded-2xl shadow-sm border border-foreground/5">
          <h2 className="font-bold">Pedidos Asignados</h2>
          <div className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-sm font-bold">
            {pendingOrders.length} pendientes
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-background/30 rounded-3xl border border-foreground/5 border-dashed">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-brand-red" />
            </div>
            <h2 className="text-xl font-bold mb-2">¡Todo al día!</h2>
            <p className="text-foreground/60 max-w-[250px]">
              No tienes pedidos pendientes por entregar en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {pendingOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-5 rounded-3xl border-l-4 border-l-brand-red shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-red">
                  Pedido #{order.trackingCode}
                </span>
                <h3 className="text-lg font-bold mt-1">
                  S/ {order.totalAmount.toFixed(2)}
                </h3>
              </div>
              <div className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-xs font-medium">
                En Camino
              </div>
            </div>

            <div className="space-y-4 mb-6 bg-background/50 p-4 rounded-2xl">
              <div className="flex gap-3 items-start">
                <MapPin className="text-foreground/40 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-foreground/50 mb-0.5">Dirección de entrega</p>
                  <p className="text-sm font-medium">{order.deliveryAddress || "Recojo en tienda"}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <User className="text-foreground/40 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-foreground/50 mb-0.5">Cliente</p>
                  <p className="text-sm font-medium">{order.customer.name}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Phone className="text-foreground/40 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-foreground/50 mb-0.5">Teléfono</p>
                  <p className="text-sm font-medium">{order.customer.phone || "No especificado"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setMapOpenFor(mapOpenFor === order.id ? null : order.id)}
                className={`flex-1 transition-colors py-3 rounded-2xl font-medium flex items-center justify-center gap-2 ${mapOpenFor === order.id ? 'bg-brand-red text-white' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground'}`}
              >
                <Navigation size={18} />
                <span className="text-sm">Mapa</span>
              </button>
              
              <button
                onClick={() => handleDeliver(order.id)}
                disabled={updating === order.id}
                className="flex-[2] bg-brand-red text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {updating === order.id ? (
                  <span className="animate-pulse">Confirmando...</span>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Entregado
                  </>
                )}
              </button>
            </div>
            
            <AnimatePresence>
              {mapOpenFor === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <MapMock />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
        )}
      </div>

      {/* DELIVERED SECTION */}
      {deliveredOrders.length > 0 && (
        <div className="flex flex-col gap-6 pt-4 border-t border-foreground/5">
          <h2 className="font-bold text-foreground/60 px-2">Historial de Entregas (Hoy)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {deliveredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-background/40 p-4 rounded-3xl border border-foreground/5 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/40">
                      #{order.trackingCode}
                    </span>
                    <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Entregado
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold opacity-70">
                      S/ {order.totalAmount.toFixed(2)}
                    </h3>
                    <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{order.deliveryAddress}</p>
                    <p className="text-xs text-foreground/50">{order.customer.name}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
