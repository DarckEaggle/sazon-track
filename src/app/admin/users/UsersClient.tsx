"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, UserCog, Bike } from "lucide-react";
import { saveStaff, deleteStaff } from "@/lib/actions/users";
import { motion, AnimatePresence } from "framer-motion";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  vehicle: string | null;
  password?: string;
};

export function UsersClient({ initialStaff }: { initialStaff: Staff[] }) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<Staff> | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      startTransition(async () => {
        const res = await deleteStaff(id);
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error);
        }
      });
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingUser?.id,
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      phone: formData.get("phone"),
      vehicle: formData.get("vehicle"),
    };

    setIsModalOpen(false);
    startTransition(async () => {
      await saveStaff(data);
      window.location.reload();
    });
  };

  const openModal = (user?: Staff) => {
    setEditingUser(user || { role: "RIDER" });
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
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((user) => (
          <div key={user.id} className="glass-panel p-6 rounded-3xl flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                  {user.role === 'ADMIN' ? <UserCog size={24} /> : <Bike size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sm text-foreground/70">
              <p><strong>Email:</strong> {user.email}</p>
              {user.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
              {user.vehicle && <p><strong>Vehículo:</strong> {user.vehicle}</p>}
            </div>

            <div className="mt-auto flex gap-2 border-t border-foreground/5 pt-4">
              <button 
                onClick={() => openModal(user)}
                className="flex-1 bg-foreground/5 hover:bg-foreground/10 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(user.id)}
                disabled={isPending}
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} /> Eliminar
              </button>
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
              className="relative w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingUser?.id ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Nombre Completo</label>
                  <input type="text" name="name" required defaultValue={editingUser?.name || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Email (Login)</label>
                    <input type="email" name="email" required defaultValue={editingUser?.email || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Contraseña</label>
                    <input type="text" name="password" required={!editingUser?.id} defaultValue={editingUser?.password || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Rol</label>
                    <select name="role" required defaultValue={editingUser?.role || "RIDER"} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                      <option value="ADMIN">Administrador</option>
                      <option value="RIDER">Motorizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Teléfono</label>
                    <input type="text" name="phone" defaultValue={editingUser?.phone || ""} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  </div>
                </div>

                {editingUser?.role === "RIDER" && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Vehículo (Solo Motorizados)</label>
                    <input type="text" name="vehicle" defaultValue={editingUser?.vehicle || ""} placeholder="Ej: Moto Honda ABC-123" className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50" />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium hover:bg-foreground/5 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isPending} className="bg-brand-red hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2">
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : "Guardar Usuario"}
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
