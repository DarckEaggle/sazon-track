"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChefHat, Bike, MapPin } from "lucide-react";

export type OrderStatus = "PENDING" | "CONFIRMED" | "IN_KITCHEN" | "ON_THE_WAY" | "DELIVERED";

const STATUS_STEPS = [
  { id: "CONFIRMED", label: "Confirmado", icon: CheckCircle2 },
  { id: "IN_KITCHEN", label: "En Cocina", icon: ChefHat },
  { id: "ON_THE_WAY", label: "En Camino", icon: Bike },
  { id: "DELIVERED", label: "Entregado", icon: MapPin },
];

export function Timeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.id === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex; // Fallback to PENDING/CONFIRMED

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-foreground/10">
      <h2 className="text-xl font-bold mb-8 text-foreground">Estado de tu Pedido</h2>
      
      <div className="relative pl-2">
        {/* Vertical line background */}
        <div className="absolute left-[1.85rem] top-4 bottom-8 w-1 bg-foreground/10 rounded-full" />
        
        {/* Active line */}
        <motion.div 
          className="absolute left-[1.85rem] top-4 w-1 bg-brand-red rounded-full"
          initial={{ height: 0 }}
          animate={{ height: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <div className="flex flex-col gap-8">
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= activeIndex;
            const isCurrent = index === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative flex items-center gap-5 z-10">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                    ${isActive 
                      ? "bg-brand-red border-brand-red text-white shadow-md" 
                      : "bg-background border-foreground/10 text-foreground/30"}
                    ${isCurrent ? "scale-125 shadow-brand-red/30 shadow-lg ring-4 ring-brand-red/20" : ""}
                  `}
                >
                  <Icon size={isCurrent ? 22 : 20} />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className={`font-bold transition-all duration-300 ${isCurrent ? "text-xl text-brand-red" : isActive ? "text-lg text-foreground" : "text-lg text-foreground/40"}`}>
                    {step.label}
                  </h3>
                  {isCurrent && index === 2 && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-foreground/60 font-medium mt-1"
                    >
                      En ruta hacia tu dirección
                    </motion.p>
                  )}
                  {isCurrent && index === 1 && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-foreground/60 font-medium mt-1"
                    >
                      Preparando tus platos
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
