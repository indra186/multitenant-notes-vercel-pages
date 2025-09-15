import prisma from '../../../lib/prisma'
import { authenticate } from '../../../lib/auth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await authenticate(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })
  const { user } = auth
  const { id } = req.query

  const note = await prisma.note.findUnique({ where: { id } })
  if (!note || note.tenantId !== user.tenantId) return res.status(404).json({ error: 'Note not found' })

  if (req.method === 'GET') return res.json(note)
  if (req.method === 'PUT') {
    const { title, content } = req.body || {}
    const updated = await prisma.note.update({ where: { id }, data: { title, content } })
    return res.json(updated)
  }
  if (req.method === 'DELETE') {
    await prisma.note.delete({ where: { id } })
    return res.json({ success: true })
  }

  return res.status(405).end()
}
