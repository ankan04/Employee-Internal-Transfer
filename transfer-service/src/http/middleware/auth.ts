/**
 * employee-internal-transfer.T18 — Implements AC7.
 * The acting subject comes from the validated token, always. A caller-supplied
 * subject is IGNORED, not rejected — rejecting leaks that the field is meaningful.
 */
import { Request, Response, NextFunction } from 'express';
import { createLocalJWKSet, jwtVerify, JSONWebKeySet } from 'jose';
import { Actor } from '../../domain/authorization/canAccess';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { actor?: Actor; correlationId?: string }
  }
}

export function authMiddleware(jwks: JSONWebKeySet) {
  const keySet = createLocalJWKSet(jwks);
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required', details: [], correlationId: req.correlationId } });
      return;
    }
    try {
      const { payload } = await jwtVerify(token, keySet);
      req.actor = {
        subjectRef: String(payload.sub),
        roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
        // C1: approver assignment is resolved elsewhere (task T29, gated).
        approverForRequestIds: [],
      };
      next();
    } catch {
      res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required', details: [], correlationId: req.correlationId } });
    }
  };
}
