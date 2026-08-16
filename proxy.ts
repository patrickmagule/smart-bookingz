import { auth } from '@/lib/auth/server';

// Next.js 16: keep this file named `proxy.ts`.
// Next.js <16: rename to `middleware.ts` and change the export to
// `export default function middleware(...)` — the auth logic is identical.
export default auth.middleware({
    loginUrl: '/auth/sign-in',
});

export const config = {
    matcher: [
        // Add every route that requires a signed-in user.
        '/dashboard/:path*',
        '/account/:path*',
        '/owner/:path*',
    ],
};
