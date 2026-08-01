"use client";

import { useState, useEffect } from "react";
import { Timeline } from "@/components/Timeline";
import { MapMock } from "@/components/MapMock";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Phone, ShieldCheck } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { supabase } from "@/lib/supabase";
import { getOrder, rateRider } from "@/lib/actions/orders";

export function TrackClient({ initialOrder }: { initialOrder: any }) {
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [showSurvey, setShowSurvey] = useState(initialOrder.feedbackScore === null);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    setSubmittingRating(true);
    await rateRider(order.id, rating);
    setShowSurvey(false);
  };

  useEffect(() => {
    // Suscribirse a cambios en la tabla Order para este pedido específico
    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Order',
          filter: `id=eq.${initialOrder.id}`,
        },
        async (payload) => {
          console.log("WebSocket Update Received:", payload.new);
          setStatus(payload.new.status);
          
          // Si avanzamos a ON_THE_WAY, necesitamos hacer refetch para obtener los datos del Courier
          if (payload.new.status === "ON_THE_WAY" || payload.new.riderId) {
            const { success, order: updatedOrder } = await getOrder(initialOrder.trackingCode);
            if (success && updatedOrder) {
              setOrder(updatedOrder);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id, initialOrder.trackingCode]);

  // Remove popup effect
  // Calcula ETA simulado de 45 min si no existe
  const etaDate = order.estimatedTime 
    ? new Date(order.estimatedTime) 
    : new Date(new Date(order.createdAt).getTime() + 45 * 60000);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pedido #{order.trackingCode}</h1>
        <p className="text-foreground/60 mt-1">
          Llegada estimada: <span className="font-bold text-foreground">
            {status === "DELIVERED" ? "Entregado" : etaDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </p>
      </div>

      <Timeline currentStatus={status as any} />
      
      {status === "ON_THE_WAY" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MapMock />
          
          {/* Courier Card */}
          {order.rider && (
            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-foreground/10 rounded-full overflow-hidden border-2 border-brand-red">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.rider.name}&backgroundColor=transparent`} 
                      alt={order.rider.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-background">
                    <ShieldCheck size={12} />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold">{order.rider.name}</h3>
                  <p className="text-sm text-foreground/60">{order.rider.vehicle}</p>
                </div>
              </div>
              
              <a 
                href={`tel:${order.rider.phone}`}
                className="w-12 h-12 bg-foreground/5 flex items-center justify-center rounded-full text-foreground hover:bg-foreground/10 transition-colors"
              >
                <Phone size={20} />
              </a>
            </div>
          )}
        </div>
      )}

      {status === "DELIVERED" && showSurvey && (
        <div className="glass-panel p-6 rounded-3xl w-full animate-in fade-in slide-in-from-bottom-4 mt-4">
          <h2 className="text-xl font-bold mb-2 text-center">¡Tu pedido ha llegado! 🎉</h2>
          <p className="text-foreground/70 mb-4 text-center">¿Qué tal estuvo la atención de {order.rider?.name || 'tu repartidor'}?</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  size={36} 
                  className={star <= rating ? "fill-brand-mustard text-brand-mustard" : "text-foreground/20"} 
                />
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleSubmitRating}
            disabled={rating === 0 || submittingRating}
            className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl disabled:opacity-50 transition-opacity"
          >
            {submittingRating ? "Enviando..." : "Enviar calificación"}
          </button>
        </div>
      )}
    </div>
  );
}
