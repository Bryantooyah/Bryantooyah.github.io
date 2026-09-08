/**
 * Error carrying an HTTP status. Anything thrown inside a route handler that is
 * NOT an HttpError is treated as an unexpected fault and reported as a 500 with
 * its message withheld from the client.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly details: Record<string, string[]> | undefined;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, string[]>): HttpError {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Not authenticated'): HttpError {
    return new HttpError(401, message);
  }

  static notFound(message = 'Not found'): HttpError {
    return new HttpError(404, message);
  }

  static tooManyRequests(message: string): HttpError {
    return new HttpError(429, message);
  }
}
