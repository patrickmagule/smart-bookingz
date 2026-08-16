import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar,
  Edit2
} from 'lucide-react';

export default async function ProfilePage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`
    SELECT * FROM users WHERE auth_id = ${authUser?.id} LIMIT 1
  `;

  const [verification] = await sql`
    SELECT status FROM owner_verifications WHERE owner_id = ${user?.id} LIMIT 1
  `;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Profile</h1>
          <p className="text-mist">Manage your personal information and account settings.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:bg-slate-50">
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
            <div className="h-24 bg-navy"></div>
            <div className="px-6 pb-6">
              <div className="-mt-12 flex justify-center">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gold/10 text-gold flex items-center justify-center text-3xl font-bold shadow-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-navy">{user?.first_name} {user?.last_name}</h3>
                <p className="text-sm text-mist">Hostel Owner</p>
              </div>
              
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  {user?.phone || 'No phone number added'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-navy mb-4">Account Status</h3>
            <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
              <div className={cn(
                "p-2 rounded-full",
                verification?.status === 'VERIFIED' ? "bg-green-100 text-green-600" : "bg-gold/10 text-gold"
              )}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-navy">
                  {verification?.status === 'VERIFIED' ? 'Verified Owner' : 'Pending Verification'}
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {verification?.status === 'VERIFIED' 
                    ? 'Your account is fully verified. Your hostels are visible to students.' 
                    : 'Your account is currently under review. Some features may be restricted until verified.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-navy mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-navy">Email Verification</p>
                  <p className="text-xs text-mist">{user?.email_verified ? 'Your email is verified' : 'Please verify your email'}</p>
                </div>
                {user?.email_verified ? (
                   <span className="text-xs font-bold text-green-600">ACTIVE</span>
                ) : (
                   <button className="text-xs font-bold text-gold hover:underline">VERIFY NOW</button>
                )}
              </div>
              <div className="h-px bg-slate-50"></div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-navy">Password</p>
                  <p className="text-xs text-mist">Last changed 3 months ago</p>
                </div>
                <button className="text-xs font-bold text-navy hover:underline">CHANGE</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
