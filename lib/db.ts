import { neon } from '@neondatabase/serverless';

// Plain Postgres connection string for your app schema (users, hostels,
// bookings, etc.) — NOT the same as NEON_AUTH_BASE_URL, which is Neon
// Auth's separate proxy endpoint for credentials/sessions.
export const sql = neon(process.env.DATABASE_URL!);
