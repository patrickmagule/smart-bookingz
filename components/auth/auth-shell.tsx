import type { ReactNode } from 'react';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true">
      <path
        d="M4 10.5 8 14.5 16 5.5"
        stroke="#C9992F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v8.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthShell({
  heading,
  subheading,
  features,
  children,
}: {
  heading: string;
  subheading: string;
  features: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FDFCFA]">
      {/* Brand panel — hidden below lg, matching the mobile reference which
          shows only the form on small screens. */}
      <aside className="relative hidden w-[42%] flex-col justify-between bg-[#16233F] px-12 py-14 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9992F]">
              <HomeMark />
            </span>
            <span className="font-serif text-xl font-semibold tracking-wide">HostelFind</span>
          </div>

          <h2 className="mt-16 font-serif text-4xl font-bold leading-tight">{heading}</h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">{subheading}</p>

          <ul className="mt-10 flex flex-col gap-4">
            {features.map((feature) => (
              <li key={feature} className="text-[15px] text-white/90">
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {/* Real photo of a hostel room from public/hostel.png */}
          <div className="mb-6 h-36 w-full overflow-hidden rounded-xl lg:h-1/2">
            <img src="/hostel.png" alt="Hostel room" className="h-full w-full object-cover" />
          </div>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} HostelFind · Smart Hostel Discovery for MUBAS Students
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16233F]">
              <HomeMark />
            </span>
            <span className="font-serif text-lg font-semibold text-[#16233F]">HostelFind</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
