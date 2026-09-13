'use client';

import { useState } from 'react';
import { Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { ProfileForm } from '@/components/owner/profile-form';
import { ProfileHeaderCard } from '@/components/profile/profile-header-card';
import { ProfileDetailItem } from '@/components/profile/profile-detail-item';
import { AccountSecurityCard } from '@/components/profile/account-security-card';
import type { UserData, VerificationData } from './types';

type ProfileViewProps = {
  user: UserData;
  verification: VerificationData | null;
};

export function ProfileView({ user, verification }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">Edit Profile</h1>
            <p className="text-mist">Update your personal information.</p>
          </div>
          <div className="max-w-2xl">
            <ProfileForm user={user} onClose={() => setIsEditing(false)} />
          </div>
        </div>
    );
  }

  const isVerified = verification?.status === 'VERIFIED';

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Profile</h1>
          <p className="text-mist">Manage your personal information and account settings.</p>
        </div>

        <ProfileHeaderCard
            firstName={user?.first_name}
            lastName={user?.last_name}
            roleLabel="Hostel Owner"
            onEdit={() => setIsEditing(true)}
        >
          <ProfileDetailItem icon={Mail}>{user?.email}</ProfileDetailItem>
          <ProfileDetailItem icon={Phone}>{user?.phone || 'No phone number added'}</ProfileDetailItem>
          <ProfileDetailItem icon={Calendar}>
            Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
          </ProfileDetailItem>
        </ProfileHeaderCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-navy">Account Status</h3>
            <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div
                  className={cn(
                      'rounded-full p-2',
                      isVerified ? 'bg-green-100 text-green-600' : 'bg-gold/10 text-gold'
                  )}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-navy">
                  {isVerified ? 'Verified Owner' : 'Pending Verification'}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {isVerified
                      ? 'Your account is fully verified. Your hostels are visible to students.'
                      : 'Your account is currently under review. Some features may be restricted until verified.'}
                </p>
              </div>
            </div>
          </div>

          <AccountSecurityCard emailVerified={user?.email_verified} email={user?.email} />
        </div>
      </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
