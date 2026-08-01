"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, EyeOff, Eye, Loader2, Image as ImageIcon } from "lucide-react";
import { toggleProductStatus, saveProduct } from "@/lib/actions/menu";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

export function MenuClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleToggleStatus = (productId: string, currentStatus: boolean, categoryId: string) => {
    // Optimistic
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          products: c.products.map(p => p.id === productId ? { ...p, isActive: !currentStatus } : p)
        };
      }
      return c;
    }));

    startTransition(async () => {
      await toggleProductStatus(productId, !currentStatus);
    });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingProduct?.id,
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      imageUrl: formData.get("imageUrl"),
      categoryId: formData.get("categoryId"),
    };

    setIsModalOpen(false);
    startTransition(async () => {
      await saveProduct(data);
      // Real app: we would re-fetch or rely on Next.js server actions revalidating path
      // but for client-side demo we might just force a reload or wait for next.js revalidation
      window.location.reload();
    });
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || {
      categoryId: categories[0]?.id
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => openModal()}
          className="bg-brand-red text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-brand-red/20 hover:bg-red-600 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="grid gap-8">
        {categories.map((category) => (
          <div key={category.id} className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-sm">
                {category.products.length}
              </span>
              {category.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.products.map((product) => (
                <div 
                  key={product.id} 
                  className={`bg-background border border-foreground/5 p-4 rounded-2xl flex flex-col transition-all ${
                    !product.isActive ? "opacity-60 grayscale" : ""
                  }`}
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-foreground/20" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold line-clamp-2">{product.name}</h3>
                      <p className="text-brand-red font-medium mt-1">S/ {product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex gap-2 border-t border-foreground/5 pt-4">
                    <button 
                      onClick={() => openModal(product)}
                      className="flex-1 bg-foreground/5 hover:bg-foreground/10 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(product.id, product.isActive, category.id)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        product.isActive 
                          ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40" 
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
                      }`}
                    >
                      {product.isActive ? <><EyeOff size={16} /> Ocultar</> : <><Eye size={16} /> Mostrar</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct?.id ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Nombre</label>
                  <input type="text" name="name" required defaultValue={editingProduct?.name || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Precio (S/)</label>
                    <input type="number" step="0.01" name="price" required defaultValue={editingProduct?.price || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Categoría</label>
                    <select name="categoryId" required defaultValue={editingProduct?.categoryId || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Descripción</label>
                  <textarea name="description" rows={2} defaultValue={editingProduct?.description || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">URL de Imagen</label>
                  <input type="url" name="imageUrl" defaultValue={editingProduct?.imageUrl || ""} placeholder="https://ejemplo.com/imagen.jpg" className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  <p className="text-xs text-foreground/50 mt-1">Ingresa el enlace directo a una imagen (jpg, png, webp).</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium hover:bg-foreground/5 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isPending} className="bg-brand-red hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2">
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : "Guardar Producto"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
