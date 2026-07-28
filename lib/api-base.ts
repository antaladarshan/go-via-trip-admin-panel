// API base URL resolver.
//
// Client-side: relative /api (same-origin) → Next.js rewrite → backend.
// Server-side: INTERNAL_API_URL must be set on the deploy host.
//   Locally it defaults to http://localhost:5000/api.
const SERVER_BASE = process.env.INTERNAL_API_URL ?? 'http://localhost:5000/api';

export const API_BASE = typeof window === 'undefined' ? SERVER_BASE : '/api';
