import { VerifyEmailClient } from './verify-email-client';

type SearchParams = {
  email?: string | string[];
  token?: string | string[];
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const email = Array.isArray(resolvedSearchParams?.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams?.email;
  const token = Array.isArray(resolvedSearchParams?.token)
    ? resolvedSearchParams.token[0]
    : resolvedSearchParams?.token;

  return <VerifyEmailClient initialEmail={email ?? null} initialToken={token?.trim() ?? null} />;
}
