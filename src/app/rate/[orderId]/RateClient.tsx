"use client";

import { useState } from "react";
import { rateOrderItems } from "@/lib/actions/orders";
import { Star, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function RateClient({ order }: { order: any }) {
  // Store ratings in a map of item.id -> rating (1-5)
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Initialize those that already have a rating (if the user tries to rate again)
  const items = order.items || [];

  const handleRating = (itemId: string, score: number) => {
    setRatings(prev => ({ ...prev, [itemId]: score }));
  };

  const handleSubmit = async () => {
    const ratingsArray = Object.entries(ratings).map(([id, rating]) => ({ id, rating }));
    
    if (ratingsArray.length === 0) return;
    
    setSubmitting(true);
    const result = await rateOrderItems(ratingsArray);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/notifications");
      }, 2000);
    } else {
      alert("Error al guardar calificaciones");
      setSubmitting(false);
    }
  };

  const allRated = items.every((item: any) => ratings[item.id] || item.rating);
  const hasSomeNewRatings = Object.keys(ratings).length > 0;

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Gracias por tu opinión!</h2>
        <p className="text-foreground/60 max-w-[250px]">
          Tus calificaciones nos ayudan a mejorar nuestros platos cada día.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {items.map((item: any) => {
          const currentRating = ratings[item.id] || item.rating || 0;
          const isAlreadyRated = !!item.rating && !ratings[item.id];
          
          return (
            <div key={item.id} className="glass-panel p-5 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {item.product.imageUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/5 shrink-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-foreground/10 shrink-0" />
                )}
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">{item.product.name}</h3>
                  <p className="text-xs text-foreground/50 mt-1">Cant: {item.quantity}</p>
                </div>
              </div>

              <div className="flex justify-center gap-2 pt-2 border-t border-foreground/5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => handleRating(item.id, star)}
                    className="focus:outline-none transition-transform hover:scale-110 p-1"
                  >
                    <Star 
                      size={32} 
                      className={`transition-colors ${star <= currentRating ? "fill-brand-mustard text-brand-mustard" : "text-foreground/20"} ${isAlreadyRated ? 'opacity-50' : ''}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={submitting || !hasSomeNewRatings}
        className="w-full py-4 bg-brand-orange text-white font-bold rounded-2xl disabled:opacity-50 transition-opacity mt-4 shadow-lg shadow-brand-orange/20"
      >
        {submitting ? "Enviando..." : "Enviar Calificaciones"}
      </button>
    </div>
  );
}
