import { authenticate } from '../../lib/auth'
import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await authenticate(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })
  const { user } = auth

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } })
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })

  return res.json({ slug: tenant.slug, name: tenant.name, plan: tenant.plan })
}
