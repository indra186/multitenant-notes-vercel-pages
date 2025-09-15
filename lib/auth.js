const jwt = require('jsonwebtoken')
const prisma = require('./prisma')
const bcrypt = require('bcryptjs')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

function signToken(user) {
  const payload = { userId: user.id, tenantId: user.tenantId, role: user.role }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

async function authenticate(req) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer (.+)$/)
  if (!m) return null
  const token = m[1]
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }})
  if (!user) return null
  return { user, tokenPayload: payload }
}

module.exports = { signToken, verifyToken, authenticate, bcrypt }
