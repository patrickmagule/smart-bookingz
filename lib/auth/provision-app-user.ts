import { randomUUID } from 'crypto';
import { sql } from '@/lib/db';

export type AppRole = 'STUDENT' | 'OWNER' | 'ADMIN';

/**
 * Creates the app-side `users` row (+ matching `student_profiles` /
 * `owner_profiles`, + a PENDING `owner_verifications` row for owners)
 * for a Neon Auth account that doesn't have one yet.
 *
 * Idempotent: safe to call more than once for the same authId — if a
 * row already exists it's returned as-is rather than duplicated.
 */
export async function provisionAppUser({
                                           authId,
                                           firstName,
                                           lastName,
                                           email,
                                           phone,
                                           role,
                                       }: {
    authId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: AppRole;
}): Promise<string> {
    const existing = await sql`
    SELECT id FROM users WHERE auth_id = ${authId} LIMIT 1
  `;

    if (existing.length > 0) {
        return existing[0].id as string;
    }

    const userId = randomUUID();

    await sql.transaction([
        sql`
      INSERT INTO users (id, auth_id, first_name, last_name, email, phone, role)
      VALUES (${userId}, ${authId}, ${firstName}, ${lastName}, ${email}, ${phone || null}, ${role})
      ON CONFLICT (auth_id) DO NOTHING
    `,
        role === 'STUDENT'
            ? sql`
          INSERT INTO student_profiles (user_id)
          VALUES (${userId})
          ON CONFLICT (user_id) DO NOTHING
        `
            : sql`
          INSERT INTO owner_profiles (user_id)
          VALUES (${userId})
          ON CONFLICT (user_id) DO NOTHING
        `,
        ...(role === 'OWNER'
            ? [
                sql`
            INSERT INTO owner_verifications (owner_id, status)
            VALUES (${userId}, 'PENDING')
          `,
            ]
            : []),
    ]);

    return userId;
}
