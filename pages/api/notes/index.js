import prisma from '../../../lib/prisma'
import { authenticate } from '../../../lib/auth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await authenticate(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })
  const { user } = auth

  if (req.method === 'GET') {
    const notes = await prisma.note.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: 'desc' } })
    return res.json(notes)
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title required' })

    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }, include: { notes: true } })
    if (tenant.plan === 'FREE') {
      const count = tenant.notes.length
      if (count >= 3) return res.status(403).json({ error: 'Free plan limit reached' })
    }

    const note = await prisma.note.create({ data: { title, content: content || '', tenantId: user.tenantId } })
    return res.status(201).json(note)
  }

  return res.status(405).end()
}
