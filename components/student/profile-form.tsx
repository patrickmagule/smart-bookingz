'use client';

import { useState, useTransition } from 'react';
import { updateStudentProfile } from '@/app/student/profile/actions';
import type { UserData, StudentProfileData, UniversityOption } from '@/app/student/profile/types';

type StudentProfileFormProps = {
    user: UserData;
    profile: StudentProfileData | null;
    universities: UniversityOption[];
    onClose: () => void;
};

const GENDER_OPTIONS = ['Male', 'Female'];

export function StudentProfileForm({ user, profile, universities, onClose }: StudentProfileFormProps) {
    const [firstName, setFirstName] = useState(user?.first_name ?? '');
    const [lastName, setLastName] = useState(user?.last_name ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [studentNumber, setStudentNumber] = useState(profile?.student_number ?? '');
    const [universityId, setUniversityId] = useState(profile?.university_id ?? '');
    const [program, setProgram] = useState(profile?.program ?? '');
    const [yearOfStudy, setYearOfStudy] = useState(
        profile?.year_of_study != null ? String(profile.year_of_study) : ''
    );
    const [gender, setGender] = useState(profile?.gender ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError('First and last name are required.');
            return;
        }

        const parsedYear = yearOfStudy.trim() ? Number(yearOfStudy) : null;
        if (parsedYear !== null && (Number.isNaN(parsedYear) || parsedYear < 0)) {
            setError('Year of study must be a positive number.');
            return;
        }

        startTransition(async () => {
            const result = await updateStudentProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                studentNumber: studentNumber.trim(),
                universityId: universityId || null,
                program: program.trim(),
                yearOfStudy: parsedYear,
                gender,
            });

            if (!result.success) {
                setError(result.error ?? 'Failed to update profile.');
                return;
            }

            onClose();
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">
                        First name
                    </label>
                    <input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Last name
                    </label>
                    <input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
                <input
                    value={user?.email ?? ''}
                    disabled
                    className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-500"
                />
                <p className="mt-1.5 text-xs text-slate-400">Your email address can&apos;t be changed here.</p>
            </div>

            <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone number
                </label>
                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0999..."
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
            </div>

            <div className="h-px bg-slate-100" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="university" className="mb-1.5 block text-sm font-medium text-slate-700">
                        University
                    </label>
                    <select
                        id="university"
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    >
                        <option value="">Select university</option>
                        {universities.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="studentNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Student number
                    </label>
                    <input
                        id="studentNumber"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="program" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Program
                    </label>
                    <input
                        id="program"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        placeholder="e.g. BSc Computer Science"
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    />
                </div>
                <div>
                    <label htmlFor="yearOfStudy" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Year of study
                    </label>
                    <input
                        id="yearOfStudy"
                        type="number"
                        min={0}
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Gender
                </label>
                <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                >
                    <option value="">Prefer not to say</option>
                    {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isPending ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}