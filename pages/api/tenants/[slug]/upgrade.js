import prisma from '../../../../lib/prisma'
import { authenticate } from '../../../../lib/auth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await authenticate(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })
  const { user } = auth
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can upgrade' })

  const { slug } = req.query
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
  if (tenant.id !== user.tenantId) return res.status(403).json({ error: 'Not allowed to upgrade this tenant' })

  await prisma.tenant.update({ where: { id: tenant.id }, data: { plan: 'PRO' } })
  return res.json({ success: true })
}
