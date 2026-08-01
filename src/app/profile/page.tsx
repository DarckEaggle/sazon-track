"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserOrders } from "@/lib/actions/orders";
import { OrderStatus } from "@prisma/client";

const STATUS_MAP = {
  PENDING: { label: "Pendiente", color: "bg-gray-500" },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-500" },
  IN_KITCHEN: { label: "En Cocina", color: "bg-brand-mustard text-black" },
  ON_THE_WAY: { label: "En Camino", color: "bg-brand-orange" },
  DELIVERED: { label: "Entregado", color: "bg-green-500" }
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndLoadOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      setUser(user);
      
      const { success, orders: userOrders } = await getUserOrders(user.id);
      if (success && userOrders) {
        setOrders(userOrders);
      }
      
      setLoading(false);
    };

    checkUserAndLoadOrders();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-foreground/5">
        <div className="animate-spin w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null; // Will redirect in useEffect

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-foreground/5 pb-8">
      {/* Header */}
      <header className="bg-brand-red pt-12 md:pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000')] bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-3xl mx-auto relative z-10 flex justify-between items-start text-white">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <button 
            onClick={handleLogout}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 max-w-3xl mx-auto w-full -mt-16 relative z-20">
        <div className="glass-panel p-6 rounded-3xl bg-background mb-6 flex items-center gap-4 shadow-sm border border-foreground/5">
          <div className="w-16 h-16 bg-brand-red text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-xl">{user.email?.split("@")[0]}</h2>
            <p className="text-foreground/60">{user.email}</p>
          </div>
        </div>

        <h3 className="font-bold text-xl mb-4 px-2">Historial de Pedidos</h3>
        
        {orders.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl bg-background flex flex-col items-center justify-center text-center shadow-sm border border-foreground/5">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-foreground/30" />
            </div>
            <h4 className="font-bold mb-2">Aún no tienes pedidos</h4>
            <p className="text-foreground/60 text-sm mb-6 max-w-xs">
              Cuando realices tu primer pedido, podrás ver el historial completo aquí.
            </p>
            <Link 
              href="/"
              className="text-brand-red font-medium border border-brand-red px-6 py-2 rounded-full hover:bg-brand-red hover:text-white transition-colors"
            >
              Empezar a pedir
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-panel p-5 rounded-3xl bg-background flex flex-col shadow-sm border border-foreground/5 transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 text-white ${STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.color || 'bg-gray-500'}`}>
                      {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.label || order.status}
                    </span>
                    <h4 className="font-bold">Pedido #{order.trackingCode}</h4>
                    <p className="text-sm text-foreground/60">
                      {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="font-bold text-lg text-brand-red">
                    S/ {order.totalAmount.toFixed(2)}
                  </div>
                </div>
                
                <div className="border-t border-foreground/5 pt-3 mt-2 flex justify-between items-center">
                  <p className="text-sm text-foreground/60">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                  <Link 
                    href={`/track/${order.trackingCode}`}
                    className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-red/80 transition-colors"
                  >
                    Ver seguimiento <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
