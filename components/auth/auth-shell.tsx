import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faLocationDot,
  faBars,
  faXmark,
  faStar,
  faCircleQuestion,
  faChevronDown,
  faCalendarDays,
  faCommentDots,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
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
        {/* Brand panel */}
        <aside className="relative hidden w-[42%] flex-col justify-between bg-[#16233F] px-12 py-14 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9992F]">
              <FontAwesomeIcon icon={faHouse} className="h-5 w-5 text-white" />
            </span>
              <span className="font-serif text-xl font-semibold tracking-wide">HostelFind</span>
            </div>

            <h2 className="mt-16 font-serif text-4xl font-bold leading-tight">{heading}</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">{subheading}</p>

            <ul className="mt-10 flex flex-col gap-4">
              {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[15px] text-white/90">
                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4 flex-none text-[#C9992F]" />
                    <span>{feature}</span>
                  </li>
              ))}
            </ul>
          </div>

          <div>
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
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4 text-white" />
            </span>
              <span className="font-serif text-lg font-semibold text-[#16233F]">HostelFind</span>
            </div>
            {children}
          </div>
        </main>
      </div>
  );
}