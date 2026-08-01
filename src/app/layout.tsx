import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { BottomNav } from "@/components/BottomNav";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Sazón Criolla - Delivery Tracker",
  description: "Rastrea tu pedido de Sazón Criolla en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${caveat.variable} font-sans antialiased relative bg-background text-foreground`}
      >
        <NotificationProvider>
          <CartProvider>
            <div className="hidden md:block">
              <FloatingNavbar />
            </div>
            <main className="pb-24 md:pb-0 min-h-screen">
              {children}
            </main>
            <div className="md:hidden">
              <BottomNav />
            </div>
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
