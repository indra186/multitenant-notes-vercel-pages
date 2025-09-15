const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  await prisma.note.deleteMany().catch(()=>{})
  await prisma.user.deleteMany().catch(()=>{})
  await prisma.tenant.deleteMany().catch(()=>{})

  const acme = await prisma.tenant.create({ data: { slug: 'acme', name: 'Acme', plan: 'FREE' } })
  const globex = await prisma.tenant.create({ data: { slug: 'globex', name: 'Globex', plan: 'FREE' } })

  const password = 'password'
  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({ data: { email: 'admin@acme.test', password: hash, role: 'ADMIN', tenantId: acme.id }})
  await prisma.user.create({ data: { email: 'user@acme.test', password: hash, role: 'MEMBER', tenantId: acme.id }})
  await prisma.user.create({ data: { email: 'admin@globex.test', password: hash, role: 'ADMIN', tenantId: globex.id }})
  await prisma.user.create({ data: { email: 'user@globex.test', password: hash, role: 'MEMBER', tenantId: globex.id }})

  await prisma.note.create({ data: { title: 'Welcome — Acme', content: 'This is Acme\'s first note', tenantId: acme.id }})
  await prisma.note.create({ data: { title: 'Welcome — Globex', content: 'This is Globex\'s first note', tenantId: globex.id }})

  console.log('Seed finished')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
