"use client";

import { motion } from "framer-motion";
import { Home, ShoppingBag, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationContext";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();

  const navItems = [
    { icon: Home, label: "Inicio", href: "/" },
    { icon: ShoppingBag, label: "Carrito", href: "/cart", badge: itemCount },
    { icon: Bell, label: "Notifs", href: "/notifications", badge: unreadCount },
    { icon: User, label: "Perfil", href: "/profile" },
  ];

  if (pathname.startsWith('/admin') || pathname.startsWith('/rider')) {
    return null;
  }

  return (
    <motion.nav 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 w-full z-50 md:hidden pb-safe"
    >
      <div className="glass-panel mx-4 mb-4 rounded-3xl px-6 py-4 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center gap-1 relative"
            >
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'text-brand-red' : 'text-foreground/60 hover:text-foreground'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
