import Link from 'next/link';

type AccountSecurityCardProps = {
  emailVerified?: boolean;
  email?: string;
};

export function AccountSecurityCard({ emailVerified, email }: AccountSecurityCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-navy">Account Security</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-navy">Email Verification</p>
            <p className="text-xs text-mist">
              {emailVerified ? 'Your email is verified' : 'Please verify your email'}
            </p>
          </div>
          {emailVerified ? (
            <span className="text-xs font-bold text-green-600">ACTIVE</span>
          ) : (
            <Link
              href={`/auth/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-xs font-bold text-gold hover:underline"
            >
              VERIFY NOW
            </Link>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-navy">Password</p>
            <p className="text-xs text-mist">Reset it any time using a one-time code.</p>
          </div>
          <Link href="/auth/forgot-password" className="text-xs font-bold text-navy hover:underline">
            CHANGE
          </Link>
        </div>
      </div>
    </div>
  );
}
