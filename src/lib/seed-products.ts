import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpiando categorías y productos antiguos...");
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creando categorías...");
  const catPlatos = await prisma.category.create({
    data: { name: "Platos Fuertes", slug: "platos" }
  });
  
  const catBebidas = await prisma.category.create({
    data: { name: "Bebidas", slug: "bebidas" }
  });
  
  const catPostres = await prisma.category.create({
    data: { name: "Postres", slug: "postres" }
  });

  console.log("Creando productos...");
  await prisma.product.createMany({
    data: [
      {
        name: "Lomo Saltado",
        description: "Trozos de lomo fino salteados con cebolla y tomate.",
        price: 35.0,
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop",
        categoryId: catPlatos.id,
        isFeatured: true
      },
      {
        name: "Ají de Gallina",
        description: "Crema de ají amarillo con pollo deshilachado y papas.",
        price: 28.0,
        imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000&auto=format&fit=crop",
        categoryId: catPlatos.id,
        isFeatured: true
      },
      {
        name: "Causa Limeña",
        description: "Puré de papa amarilla con ají, rellena de pollo.",
        price: 22.0,
        imageUrl: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=1000&auto=format&fit=crop",
        categoryId: catPlatos.id,
        isFeatured: true
      },
      {
        name: "Chicha Morada",
        description: "Bebida tradicional de maíz morado (1 Litro).",
        price: 10.0,
        imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000&auto=format&fit=crop",
        categoryId: catBebidas.id,
        isFeatured: true
      },
      {
        name: "Inca Kola",
        description: "La bebida del sabor nacional (Personal).",
        price: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop",
        categoryId: catBebidas.id,
        isFeatured: false
      },
      {
        name: "Suspiro a la Limeña",
        description: "Delicioso manjar blanco con merengue al oporto.",
        price: 12.0,
        imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000&auto=format&fit=crop",
        categoryId: catPostres.id,
        isFeatured: true
      }
    ]
  });

  console.log("¡Productos sembrados con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
