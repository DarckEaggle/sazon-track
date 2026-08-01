import { getActiveOrders } from "@/lib/actions/orders";
import { getRiders } from "@/lib/actions/staff";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { orders, success: ordersSuccess } = await getActiveOrders();
  const { riders, success: ridersSuccess } = await getRiders();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Pedidos</h1>
          <p className="text-foreground/60">Control de flujo de despachos en tiempo real</p>
        </div>
      </div>

      {!ordersSuccess || !ridersSuccess ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando datos. Verifica la conexión a la BD.</div>
      ) : (
        <AdminClient initialOrders={orders as any} riders={riders || []} />
      )}
    </div>
  );
}
