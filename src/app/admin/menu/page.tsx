import { getCategoriesWithProducts } from "@/lib/actions/menu";
import { MenuClient } from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const { categories, success } = await getCategoriesWithProducts();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Catálogo</h1>
        <p className="text-foreground/60">Administra los productos y categorías disponibles</p>
      </div>

      {!success || !categories ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando el catálogo.</div>
      ) : (
        <MenuClient initialCategories={categories as any} />
      )}
    </div>
  );
}
