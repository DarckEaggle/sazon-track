import { cookies } from "next/headers";
import { getRiderOrders } from "@/lib/actions/rider";
import { logoutStaff } from "@/lib/actions/auth";
import { RiderClient } from "./RiderClient";
import { LogOut, Bike } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("staff_session");
  let riderId = undefined;
  
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.role === "RIDER") {
        riderId = session.id;
      }
    } catch (e) {
      console.error("Invalid session cookie", e);
    }
  }

  const { orders, rider, success, error } = await getRiderOrders(riderId);

  return (
    <div className="w-full min-h-screen bg-foreground/5 pb-safe">
      {/* Header Glass */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-foreground/10 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white shadow-md">
              <Bike size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Mis Entregas</h1>
              <p className="text-xs text-foreground/60">{rider?.name || "Repartidor"}</p>
            </div>
          </div>
          
          <form action={logoutStaff}>
            <button type="submit" className="p-2 rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-brand-red transition-colors flex items-center justify-center">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 w-full">

        {!success ? (
          <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <RiderClient initialOrders={orders as any} />
        )}
      </div>
    </div>
  );
}
