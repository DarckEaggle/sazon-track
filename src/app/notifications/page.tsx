"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, PackageOpen, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { refreshCount, decrementCount, resetCount } = useNotifications();

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const data = await getUserNotifications(user.id);
      setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();
  }, [router, supabase.auth]);

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const result = await markAllNotificationsAsRead(user.id);
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        resetCount();
      }
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      decrementCount();
    }

    if (notif.orderId) {
      if (notif.type === "RATE_ORDER") {
        router.push(`/rate/${notif.orderId}`);
      } else {
        router.push(`/track/${notif.orderId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col bg-foreground/5 pb-8">
        <header className="bg-brand-red pt-12 md:pt-32 pb-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000')] bg-cover bg-center mix-blend-overlay" />
          <div className="max-w-3xl mx-auto relative z-10 flex justify-between items-start text-white">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell size={28} />
              Notificaciones
            </h1>
          </div>
        </header>
        <main className="flex-1 px-4 max-w-3xl mx-auto w-full -mt-16 relative z-20 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl h-24 animate-pulse bg-background" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-foreground/5 pb-8">
      {/* Header */}
      <header className="bg-brand-red pt-12 md:pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000')] bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 text-white mb-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
              <ArrowLeft size={24} />
            </Link>
          </div>
          <div className="flex justify-between items-end text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell size={28} />
              Notificaciones
            </h1>
            {notifications.some(n => !n.read) && (
              <button 
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
              >
                <Check size={16} />
                Marcar todo leído
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 max-w-3xl mx-auto w-full -mt-16 relative z-20 flex flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl bg-background text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/30">
              <Bell size={32} />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-1">Nada por aquí</h2>
              <p className="text-foreground/60 text-sm">Aún no tienes notificaciones.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`glass-panel p-4 rounded-2xl flex gap-4 transition-all cursor-pointer hover:shadow-md ${notif.read ? 'bg-background' : 'bg-brand-red/5 border-brand-red/20 border'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-foreground/5 text-foreground/40' : 'bg-brand-red/10 text-brand-red'}`}>
                  {notif.type === "RATE_ORDER" ? <Star size={24} /> : notif.orderId ? <PackageOpen size={24} /> : <Bell size={24} />}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-bold text-sm md:text-base ${notif.read ? 'text-foreground/80' : 'text-foreground'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-red shrink-0 mt-1.5"></span>
                    )}
                  </div>
                  <p className={`text-sm ${notif.read ? 'text-foreground/60' : 'text-foreground/80'}`}>
                    {notif.message}
                  </p>
                  <span className="text-xs text-foreground/40 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString('es-ES', { 
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
