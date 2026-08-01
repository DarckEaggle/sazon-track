"use client";

import { useActionState } from "react";
import { loginStaff } from "@/lib/actions/auth";
import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function StaffLogin() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await loginStaff(formData);
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-red text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-red/30">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold">Acceso de Personal</h1>
          <p className="text-foreground/60 mt-2">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1 text-foreground/80">Correo Electrónico</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@sazon.com"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-foreground/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all"
                placeholder="ejemplo@sazon.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1 text-foreground/80">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
              <input
                type="password"
                name="password"
                required
                defaultValue="admin123"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-foreground/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 text-sm rounded-xl border border-red-100 dark:border-red-900/30 text-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-red hover:bg-red-600 text-white font-medium py-3.5 rounded-2xl shadow-lg shadow-brand-red/25 transition-all disabled:opacity-50 mt-4"
          >
            {isPending ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
