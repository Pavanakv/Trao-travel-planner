// Centralizes error responses so internal error details (Mongo errors,
// stack traces, etc.) never reach the client in production - only a safe
// message does. Full details are still logged server-side for debugging.
export function sendError(res, status, message, err) {
  if (err) {
    console.error(message, err);
  }

  const payload = { message };
  if (err && process.env.NODE_ENV !== 'production') {
    payload.error = err.message;
  }

  return res.status(status).json(payload);
}

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
