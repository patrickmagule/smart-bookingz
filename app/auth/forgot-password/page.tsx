import { ForgotPasswordClient } from './forgot-password-client';

type SearchParams = {
    email?: string | string[];
};

export default async function ForgotPasswordPage({
                                                     searchParams,
                                                 }: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const email = Array.isArray(resolvedSearchParams?.email)
        ? resolvedSearchParams.email[0]
        : resolvedSearchParams?.email;

    return <ForgotPasswordClient initialEmail={email ?? null} />;
}