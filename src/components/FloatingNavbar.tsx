"use client";

import { MapPin, Bell, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationContext";

export function FloatingNavbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();

  if (pathname.startsWith('/admin') || pathname.startsWith('/rider')) {
    return null;
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <nav className="glass-panel rounded-full px-6 py-4 flex items-center justify-between shadow-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-handwriting text-xl">
            S
          </div>
          <span className="font-handwriting text-2xl font-bold hidden sm:block mt-1">
            Sazón Criolla
          </span>
        </Link>



        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link href="/notifications" className={`p-2 rounded-full transition-colors relative hidden sm:flex items-center gap-2 ${pathname === '/notifications' ? 'bg-brand-red text-white' : 'hover:bg-foreground/5'}`}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                {unreadCount}
              </span>
            )}
          </Link>
          
          <Link href="/profile" className={`p-2 rounded-full transition-colors ${pathname === '/profile' ? 'bg-brand-red text-white' : 'hover:bg-foreground/5'}`}>
            <User size={20} />
          </Link>
          
          <Link href="/cart" className={`p-2 rounded-full transition-colors relative flex items-center gap-2 ${pathname === '/cart' ? 'bg-brand-red text-white' : 'hover:bg-foreground/5 bg-foreground/5'}`}>
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
}
