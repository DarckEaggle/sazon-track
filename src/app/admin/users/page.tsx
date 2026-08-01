import { getStaff } from "@/lib/actions/staff";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { staff, success } = await getStaff();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h1>
        <p className="text-foreground/60">Administra los roles y accesos del personal</p>
      </div>

      {!success || !staff ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando usuarios.</div>
      ) : (
        <UsersClient initialStaff={staff as any} />
      )}
    </div>
  );
}
