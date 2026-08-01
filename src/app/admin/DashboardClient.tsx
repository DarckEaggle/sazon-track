"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Activity, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

type Metrics = {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  statusCounts: Record<string, number>;
};

// Mock data for charts
const weeklySales = [
  { name: "Lun", ventas: 400 },
  { name: "Mar", ventas: 300 },
  { name: "Mie", ventas: 550 },
  { name: "Jue", ventas: 450 },
  { name: "Vie", ventas: 700 },
  { name: "Sab", ventas: 900 },
  { name: "Dom", ventas: 850 },
];

export function DashboardClient({ metrics }: { metrics: Metrics }) {
  const statusData = [
    { name: "Pendiente", cantidad: metrics.statusCounts["PENDING"] || 0 },
    { name: "Confirmado", cantidad: metrics.statusCounts["CONFIRMED"] || 0 },
    { name: "Cocina", cantidad: metrics.statusCounts["IN_KITCHEN"] || 0 },
    { name: "En Camino", cantidad: metrics.statusCounts["ON_THE_WAY"] || 0 },
    { name: "Entregado", cantidad: metrics.statusCounts["DELIVERED"] || 0 },
  ];

  const cards = [
    {
      title: "Ingresos Totales",
      value: `S/ ${metrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Pedidos Totales",
      value: metrics.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pedidos Activos",
      value: metrics.activeOrders,
      icon: Activity,
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
    },
    {
      title: "Rendimiento Semanal",
      value: "+12.5%",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-3xl flex items-center justify-between"
            >
              <div>
                <p className="text-foreground/60 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
                <Icon className={card.color} size={24} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-3xl"
        >
          <h3 className="text-lg font-bold mb-6">Ventas de la Semana</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888833" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--background)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="ventas" stroke="#E63946" strokeWidth={3} dot={{ r: 4, fill: '#E63946' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-3xl"
        >
          <h3 className="text-lg font-bold mb-6">Estado de Pedidos</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888833" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--background)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#88888811' }}
                />
                <Bar dataKey="cantidad" fill="#F4A261" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
