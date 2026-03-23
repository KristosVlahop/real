import type { Request, Response, NextFunction } from "express";

// In-memory token store (demo-grade; swap for JWT/Redis later)
const tokenStore = new Map<string, string>(); // token -> userId

export function storeToken(token: string, userId: string): void {
  tokenStore.set(token, userId);
}

export function removeToken(token: string): void {
  tokenStore.delete(token);
}

export function getUserIdFromToken(token: string): string | undefined {
  return tokenStore.get(token);
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
    return;
  }

  req.userId = userId;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = getUserIdFromToken(token);
    if (userId) {
      req.userId = userId;
    }
  }
  next();
}
