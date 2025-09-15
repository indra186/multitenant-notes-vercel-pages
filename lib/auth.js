import jwt from "jsonwebtoken";
import prisma from "./prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "changeme-secret";

// Sign JWT
export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Verify JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware helper: Require Auth
export async function requireAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return user;
}
