"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Search, ArrowRight, MapPin, Clock, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getCategories, getProducts } from "@/lib/actions/products";

export default function Home() {
  const [trackingId, setTrackingId] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      const formattedId = trackingId.toUpperCase().startsWith("SAZ-") 
        ? trackingId.toUpperCase() 
        : `SAZ-${trackingId}`;
      router.push(`/track/${formattedId}`);
    }
  };

  const filteredProducts = products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-12 md:pt-32 overflow-hidden bg-brand-red text-white md:rounded-b-[3rem] mb-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-handwriting mb-4">
              Sazón Criolla
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-light">
              El auténtico sabor peruano directo a tu casa.
            </p>
            
            {/* Tracking Input Container */}
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full flex flex-col sm:flex-row gap-2 border border-white/30">
                <form onSubmit={handleTrack} className="flex-1 flex items-center relative">
                  <Search className="absolute left-4 text-white/70" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rastrear pedido (SAZ-002)" 
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-white/70 font-medium"
                  />
                  <button 
                    type="submit"
                    className="absolute right-1 p-2 bg-white text-brand-red rounded-full hover:bg-white/90 transition-colors shadow-md"
                  >
                    <ArrowRight size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-handwriting mb-4">Nuestro Menú</h2>
          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-6 py-4 rounded-full bg-foreground/10 animate-pulse w-24"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-brand-red text-white shadow-md' 
                      : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 mb-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass-panel rounded-2xl h-80 animate-pulse bg-foreground/5"></div>
            ))
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col group">
                <div className="h-48 overflow-hidden relative">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-sm text-brand-red">
                    S/ {product.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                  <p className="text-foreground/60 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-xl font-medium hover:bg-foreground/90 transition-colors active:scale-95"
                  >
                    <ShoppingBag size={18} />
                    Agregar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-foreground/10 bg-foreground/5 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-handwriting text-brand-red mb-3">Nuestros Valores</h2>
            <p className="text-foreground/70 max-w-lg mx-auto">
              Nos esforzamos cada día por brindarte la mejor experiencia culinaria con el sello de Sazón Criolla.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center glass-panel p-6 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-gold/10 rounded-full text-brand-gold mb-4">
                <UtensilsCrossed size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Sabor Auténtico</h3>
              <p className="text-foreground/60 text-sm">Recetas tradicionales con ingredientes frescos y el verdadero sabor de casa.</p>
            </div>
            <div className="flex flex-col items-center glass-panel p-6 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-gold/10 rounded-full text-brand-gold mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Entrega Rápida</h3>
              <p className="text-foreground/60 text-sm">Tu comida llega caliente, en su punto exacto y en el tiempo prometido.</p>
            </div>
            <div className="flex flex-col items-center glass-panel p-6 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-gold/10 rounded-full text-brand-gold mb-4">
                <MapPin size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Tracking en Vivo</h3>
              <p className="text-foreground/60 text-sm">Sigue a tu motorizado desde nuestra cocina hasta la puerta de tu hogar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Footer */}
      <footer className="bg-zinc-950 text-zinc-300 py-12 px-4 mt-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-handwriting text-white mb-4">Sazón Criolla</h3>
            <p className="text-sm text-zinc-400 mb-4 max-w-xs">
              Llevando la mejor gastronomía a tu mesa. Pasión por la buena comida y el servicio excepcional.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-red shrink-0 mt-0.5" />
                <span>Av. de la Gastronomía 1234, Distrito Culinario, Ciudad.</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(01) 234-5678 / 987 654 321</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contacto@sazoncriolla.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Horario de Atención</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span className="text-white">11:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sábados:</span>
                <span className="text-white">11:00 AM - 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Domingos:</span>
                <span className="text-white">10:00 AM - 9:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-4xl mx-auto border-t border-zinc-800 mt-10 pt-6 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Sazón Criolla. Todos los derechos reservados.
        </div>
      </footer>
      
      {/* Mobile nav padding (moved after footer) */}
      <div className="h-16 md:h-0 bg-zinc-950"></div>
    </div>
  );
}
