'use client';

import { useState } from 'react';
import { User, Phone, Save, X } from 'lucide-react';
import { updateProfile } from '@/app/hostelOwner/profile/actions';

type ProfileFormProps = {
  user: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  onClose: () => void;
};

export function ProfileForm({ user, onClose }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateProfile({ firstName, lastName, phone });
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-navy text-[15px] uppercase tracking-wider">Edit Profile Information</h3>
        <button 
          type="button" 
          onClick={onClose}
          className="text-slate-400 hover:text-navy transition"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-2">
            <User size={12} /> First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-navy outline-none transition focus:border-navy"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-2">
            <User size={12} /> Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-navy outline-none transition focus:border-navy"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-2">
          <Phone size={12} /> Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-navy outline-none transition focus:border-navy"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Email Address (Read-only)
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-navy/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
