"use client";

import { useCart } from "@/context/CartContext";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, MapPin, MessageSquare, User as UserIcon, Phone, CreditCard, Banknote, QrCode, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createOrder, getCustomerProfile } from "@/lib/actions/checkout";

import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Smart checkout fields
  const [customerName, setCustomerName] = useState("Cliente Invitado");
  const [customerPhone, setCustomerPhone] = useState("");
  const [authId, setAuthId] = useState<string | undefined>(undefined);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"YAPE" | "PLIN" | "TARJETA" | "EFECTIVO">("YAPE");
  const [operationNumber, setOperationNumber] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthId(user.id);
        setCustomerName(user.email?.split("@")[0] || "Cliente Invitado");
        
        // Fetch previous profile from database
        const { success, customer } = await getCustomerProfile(user.id);
        if (success && customer) {
          if (customer.name) setCustomerName(customer.name);
          if (customer.phone) setCustomerPhone(customer.phone);
          if (customer.address) setAddress(customer.address);
        }
      }
    };
    fetchUserData();
  }, [supabase.auth]);

  const validateFormAndProceed = () => {
    if (!address.trim()) {
      alert("Por favor, ingresa tu dirección de entrega.");
      return;
    }
    if (!customerPhone.trim()) {
      alert("Por favor, ingresa tu número de celular.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleCheckout = async () => {
    if (["YAPE", "PLIN"].includes(paymentMethod) && !operationNumber.trim()) {
      alert("Por favor, ingresa el número de operación.");
      return;
    }

    setLoading(true);
    
    // Append payment info to notes
    const paymentInfo = `[Pago: ${paymentMethod}${["YAPE", "PLIN"].includes(paymentMethod) ? ' - Op: ' + operationNumber : ''}]`;
    const finalNotes = notes ? `${paymentInfo}\n${notes}` : paymentInfo;

    const orderData = {
      customerName,
      customerPhone,
      totalAmount: total,
      deliveryAddress: address,
      notes: finalNotes,
      authId,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const result = await createOrder(orderData);
    
    if (result.success && result.trackingCode) {
      clearCart();
      setShowPaymentModal(false);
      router.push(`/track/${result.trackingCode}`);
    } else {
      alert("Hubo un error al procesar tu orden: " + result.error);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-foreground/30" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-foreground/60 text-center mb-8 max-w-md">
          Aún no has agregado ningún plato a tu pedido. ¡Descubre nuestro menú y anímate a probar el sabor Sazón Criolla!
        </p>
        <Link 
          href="/"
          className="bg-brand-red text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-brand-red/90 transition-colors"
        >
          Explorar Menú
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-foreground/5">
      {/* Header Mobile */}
      <header className="md:hidden sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 py-4 flex items-center gap-4 border-b border-foreground/10">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-foreground/5">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Tu Pedido ({itemCount})</h1>
      </header>

      {/* Cart Items */}
      <main className="flex-1 px-4 py-6 md:pt-32 max-w-3xl mx-auto w-full flex flex-col gap-6">
        <h1 className="hidden md:block text-3xl font-bold mb-2">Tu Pedido ({itemCount})</h1>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-2xl flex gap-4 bg-background">
              {item.imageUrl && (
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-foreground/40 hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="font-bold text-brand-red">
                  S/ {(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-3 bg-foreground/5 rounded-full px-1 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground hover:bg-foreground/5"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground hover:bg-foreground/5"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de envío */}
        <div className="glass-panel p-5 rounded-2xl bg-background space-y-4">
          <h3 className="font-bold text-lg mb-2">Detalles de Entrega</h3>
          
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre completo" 
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-xl focus:ring-2 focus:ring-brand-red text-foreground placeholder:text-foreground/40"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <input 
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Número de celular" 
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-xl focus:ring-2 focus:ring-brand-red text-foreground placeholder:text-foreground/40"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-foreground/40" size={20} />
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección completa de entrega..." 
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-xl focus:ring-2 focus:ring-brand-red text-foreground placeholder:text-foreground/40 min-h-[80px] resize-none"
              required
            />
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-foreground/40" size={20} />
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas para el pedido (opcional)... Ej: Sin picante, tocar el timbre fuerte." 
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-xl focus:ring-2 focus:ring-brand-red text-foreground placeholder:text-foreground/40 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </main>

      {/* Checkout Footer */}
      <div className="bg-background border-t border-foreground/10 px-4 py-6 pb-8 md:pb-6 sticky bottom-0 z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-foreground/60 font-medium">Total a pagar</span>
            <span className="text-2xl font-bold">S/ {total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={validateFormAndProceed}
            className="w-full bg-brand-red text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-brand-red/90 transition-colors active:scale-[0.98]"
          >
            Proceder al Pago
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-foreground/10 animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-foreground/10 flex justify-between items-center bg-foreground/5">
              <h2 className="font-bold text-xl">Método de Pago</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("YAPE")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === "YAPE" ? "border-brand-red bg-brand-red/5" : "border-foreground/10 hover:border-foreground/20"}`}
                >
                  <QrCode size={28} className={paymentMethod === "YAPE" ? "text-brand-red" : "text-foreground/60"} />
                  <span className="font-bold text-sm">Yape</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("PLIN")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === "PLIN" ? "border-blue-500 bg-blue-500/5" : "border-foreground/10 hover:border-foreground/20"}`}
                >
                  <QrCode size={28} className={paymentMethod === "PLIN" ? "text-blue-500" : "text-foreground/60"} />
                  <span className="font-bold text-sm">Plin</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("TARJETA")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === "TARJETA" ? "border-brand-red bg-brand-red/5" : "border-foreground/10 hover:border-foreground/20"}`}
                >
                  <CreditCard size={28} className={paymentMethod === "TARJETA" ? "text-brand-red" : "text-foreground/60"} />
                  <span className="font-bold text-sm">Tarjeta</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("EFECTIVO")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === "EFECTIVO" ? "border-green-500 bg-green-500/5" : "border-foreground/10 hover:border-foreground/20"}`}
                >
                  <Banknote size={28} className={paymentMethod === "EFECTIVO" ? "text-green-500" : "text-foreground/60"} />
                  <span className="font-bold text-sm">Efectivo</span>
                </button>
              </div>

              {/* Dynamic Payment Content */}
              <div className="bg-foreground/5 p-4 rounded-2xl min-h-[200px] flex flex-col justify-center">
                {paymentMethod === "YAPE" || paymentMethod === "PLIN" ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex gap-4 items-center justify-center">
                      <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-sm flex items-center justify-center">
                        <QrCode size={64} className={paymentMethod === "YAPE" ? "text-brand-red" : "text-blue-500"} />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/60">Escanea o envía a:</p>
                        <p className="font-bold text-lg">987 654 321</p>
                        <p className="text-sm font-medium">Sazón Criolla S.A.C</p>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Nro. de Operación"
                      value={operationNumber}
                      onChange={(e) => setOperationNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red text-center font-mono tracking-widest"
                    />
                  </div>
                ) : paymentMethod === "TARJETA" ? (
                  <div className="space-y-3 animate-in fade-in">
                    <input type="text" placeholder="Número de Tarjeta" className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:ring-2 focus:ring-brand-red" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:ring-2 focus:ring-brand-red" />
                      <input type="text" placeholder="CVC" className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:ring-2 focus:ring-brand-red" />
                    </div>
                    <p className="text-xs text-foreground/60 text-center mt-2 flex items-center justify-center gap-1">
                      <CreditCard size={12} /> Pagos seguros encriptados
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 animate-in fade-in">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                      <Banknote size={32} />
                    </div>
                    <p className="font-medium text-lg">Pago contra entrega</p>
                    <p className="text-foreground/60 text-sm">Le cobraremos el monto exacto al entregar su pedido. Por favor, trate de tener el sencillo a la mano.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-colors flex items-center justify-center gap-2 ${
                  paymentMethod === "YAPE" ? "bg-brand-red hover:bg-brand-red/90 text-white" :
                  paymentMethod === "PLIN" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                  paymentMethod === "TARJETA" ? "bg-foreground text-background hover:bg-foreground/90" :
                  "bg-green-500 hover:bg-green-600 text-white"
                } disabled:opacity-50`}
              >
                {loading ? "Confirmando..." : (
                  <>
                    <CheckCircle2 size={24} />
                    Confirmar S/ {total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
