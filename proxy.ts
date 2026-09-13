// proxy.ts
import { auth } from '@/lib/auth/server';

export default auth.middleware({
    loginUrl: '/auth/sign-in',
});

export const config = {
    matcher: [
        /*
         * Changed .+ to .* at the end so it matches the root path '/'
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    ],
};