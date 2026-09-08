/** Attaches the authenticated admin to the request, populated by requireAuth. */
declare global {
  namespace Express {
    interface Request {
      admin?: { id: number; email: string };
    }
  }
}

export {};
