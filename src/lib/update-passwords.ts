import { prisma } from './prisma';

async function main() { 
  await prisma.staff.update({ where: { email: 'admin@sazon.com' }, data: { password: 'admin123' }}); 
  await prisma.staff.update({ where: { email: 'carlos@sazon.com' }, data: { password: 'rider123' }}); 
  console.log('Updated passwords successfully!'); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
