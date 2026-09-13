'use client';

import { useState } from 'react';
import { Mail, Phone, Calendar, GraduationCap, Hash } from 'lucide-react';
import { ProfileHeaderCard } from '@/components/profile/profile-header-card';
import { ProfileDetailItem } from '@/components/profile/profile-detail-item';
import { AccountSecurityCard } from '@/components/profile/account-security-card';
import { StudentProfileForm } from '@/components/student/profile-form';
import type { UserData, StudentProfileData, UniversityOption } from './types';

type StudentProfileViewProps = {
  user: UserData;
  profile: StudentProfileData | null;
  universities: UniversityOption[];
};

export function StudentProfileView({ user, profile, universities }: StudentProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Edit Profile</h1>
          <p className="text-mist">Update your personal and study information.</p>
        </div>
        <div className="max-w-2xl">
          <StudentProfileForm
            user={user}
            profile={profile}
            universities={universities}
            onClose={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        <p className="text-mist">Manage your personal information and account settings.</p>
      </div>

      <ProfileHeaderCard
        firstName={user?.first_name}
        lastName={user?.last_name}
        roleLabel={profile?.university_name ? `Student · ${profile.university_name}` : 'Student'}
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
          <h3 className="mb-4 text-lg font-bold text-navy">Study Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="flex items-center gap-2 text-slate-500">
                <GraduationCap size={15} className="text-slate-400" />
                University
              </span>
              <span className="font-medium text-navy">{profile?.university_name || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-500">Program</span>
              <span className="font-medium text-navy">{profile?.program || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-500">Year of study</span>
              <span className="font-medium text-navy">{profile?.year_of_study ?? 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Hash size={15} className="text-slate-400" />
                Student number
              </span>
              <span className="font-medium text-navy">{profile?.student_number || 'Not set'}</span>
            </div>
          </div>
        </div>

        <AccountSecurityCard emailVerified={user?.email_verified} email={user?.email} />
      </div>
    </div>
  );
}
