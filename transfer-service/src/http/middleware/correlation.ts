/** employee-internal-transfer.T09 — constitution §4. */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-correlation-id');
  req.correlationId = incoming && /^[0-9a-f-]{36}$/i.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Correlation-Id', req.correlationId);
  next();
}
