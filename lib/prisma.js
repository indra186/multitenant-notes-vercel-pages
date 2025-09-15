const { PrismaClient } = require('@prisma/client')
const globalForPrisma = global

let prisma
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}
prisma = globalForPrisma.prisma
module.exports = prisma
