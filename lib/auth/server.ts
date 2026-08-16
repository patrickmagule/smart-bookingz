// import { createNeonAuth } from "@neondatabase/auth/next/server";
//
// export const auth = createNeonAuth({
//     baseUrl: process.env.NEON_AUTH_BASE_URL!,
//     cookies: {
//         secret: process.env.NEON_AUTH_COOKIE_SECRET!,
//     },
// });
//

import { createNeonAuth } from '@neondatabase/auth/next/server';

/**
 * Single server-side auth instance. Provides:
 *  - auth.handler()      -> mounted in app/api/auth/[...path]/route.ts
 *  - auth.middleware()   -> used in proxy.ts / middleware.ts
 *  - auth.getSession()   -> read the current session in server components
 *  - auth.signUp / auth.signIn / auth.signOut -> used from server actions
 */
export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    },
});
