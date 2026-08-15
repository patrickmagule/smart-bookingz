'use client';

export type SignUpRole = 'student' | 'owner';

const OPTIONS: { value: SignUpRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'owner', label: 'Hostel Owner' },
];

/**
 * Sign-up role selector. Intentionally offers only Student and Hostel
 * Owner — there is no Admin option here. Admin accounts should be
 * provisioned separately (e.g. directly in the database or an internal
 * tool), never through the public sign-up form.
 */
export function RoleToggle({
  value,
  onChange,
  name = 'role',
}: {
  value: SignUpRole;
  onChange: (role: SignUpRole) => void;
  name?: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        Register as
      </span>

      {/* Hidden input carries the selected value into the form submission */}
      <input type="hidden" name={name} value={value} />

      <div
        role="radiogroup"
        aria-label="Register as"
        className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200"
      >
        {OPTIONS.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={[
                'px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9992F] focus-visible:ring-offset-1',
                active ? 'bg-[#16233F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                index === 0 ? 'border-r border-slate-200' : '',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
