import { auth } from '@/lib/auth/server';

// Next.js 16: keep this file named `proxy.ts`.
// Next.js <16: rename to `middleware.ts` and change the export to
// `export default function middleware(...)` — the auth logic is identical.
export default auth.middleware({
    loginUrl: '/auth/sign-in',
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth).+)',
    ],
};
