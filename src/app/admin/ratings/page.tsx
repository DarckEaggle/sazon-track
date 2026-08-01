import { getRatingsStats } from "@/lib/actions/ratings";
import { Star, User, Package, Trophy } from "lucide-react";

export default async function AdminRatingsPage() {
  const { topProducts, topRiders, success } = await getRatingsStats();

  if (!success) {
    return <div className="p-8 text-brand-red">Error al cargar las estadísticas de calificaciones.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Puntuaciones</h1>
        <p className="text-foreground/60">Monitorea la satisfacción de los clientes respecto a productos y repartidores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
            <div className="p-3 bg-brand-mustard/10 rounded-xl text-brand-mustard">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Platos Mejor Puntuados</h2>
              <p className="text-sm text-foreground/60">Basado en calificación de clientes</p>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts?.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-foreground/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-mustard/20 flex items-center justify-center text-brand-mustard font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-xs text-foreground/50">{product.totalRatings} valoraciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-brand-mustard/10 px-3 py-1.5 rounded-full text-brand-mustard font-bold">
                  <Star size={16} className="fill-brand-mustard" />
                  {product.averageRating.toFixed(1)}
                </div>
              </div>
            ))}
            
            {(!topProducts || topProducts.length === 0) && (
              <div className="text-center py-8 text-foreground/50">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aún no hay calificaciones de productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Riders */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
            <div className="p-3 bg-brand-orange/10 rounded-xl text-brand-orange">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Repartidores Mejor Puntuados</h2>
              <p className="text-sm text-foreground/60">Basado en atención al cliente</p>
            </div>
          </div>

          <div className="space-y-4">
            {topRiders?.map((rider, index) => (
              <div key={rider.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-foreground/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold">{rider.name}</h3>
                    <p className="text-xs text-foreground/50">{rider.totalRatings} valoraciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-brand-mustard/10 px-3 py-1.5 rounded-full text-brand-mustard font-bold">
                  <Star size={16} className="fill-brand-mustard" />
                  {rider.averageRating.toFixed(1)}
                </div>
              </div>
            ))}
            
            {(!topRiders || topRiders.length === 0) && (
              <div className="text-center py-8 text-foreground/50">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aún no hay calificaciones de repartidores</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
