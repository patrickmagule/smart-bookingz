'use client';

import { Edit2 } from 'lucide-react';
import type { ReactNode } from 'react';

type ProfileHeaderCardProps = {
  firstName?: string;
  lastName?: string;
  roleLabel: string;
  onEdit: () => void;
  /** Small icon+text detail items (email, phone, joined date, ...) */
  children?: ReactNode;
};

export function ProfileHeaderCard({
  firstName,
  lastName,
  roleLabel,
  onEdit,
  children,
}: ProfileHeaderCardProps) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-base font-bold text-white">
            {initials || '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy">
              {firstName} {lastName}
            </h3>
            <p className="text-sm text-mist">{roleLabel}</p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50 sm:self-auto"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      {children && (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
          {children}
        </div>
      )}
    </div>
  );
}
