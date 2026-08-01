import { getDashboardMetrics } from "@/lib/actions/dashboard";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { metrics, success } = await getDashboardMetrics();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard General</h1>
        <p className="text-foreground/60">Resumen del negocio y rendimiento</p>
      </div>

      {!success || !metrics ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando métricas.</div>
      ) : (
        <DashboardClient metrics={metrics} />
      )}
    </div>
  );
}
