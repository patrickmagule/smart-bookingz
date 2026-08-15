'use client';

import { useId, useState } from 'react';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.3 6.5C4.1 8 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.9-1.3M9.9 5.2C10.6 5.1 11.3 5 12 5c6.5 0 10 7 10 7-.5.9-1.4 2.3-2.6 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PasswordField({
  id,
  name = 'password',
  label = 'Password',
  autoComplete = 'current-password',
}: {
  id?: string;
  name?: string;
  label?: string;
  autoComplete?: 'current-password' | 'new-password';
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
