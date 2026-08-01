import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";');
    console.log('Realtime enabled for Notification table');
  } catch (error: any) {
    if (error.message.includes('already in publication')) {
      console.log('Already enabled');
    } else {
      console.error(error);
    }
  }
}

main().finally(() => prisma.$disconnect());
