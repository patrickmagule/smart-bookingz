import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faPhone, faBed, faMessage, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const UNLOCKS = [
    { icon: faLocationDot, text: 'Exact address and directions' },
    { icon: faPhone, text: "Owner's phone number and email" },
    { icon: faBed, text: 'Live room and bed availability' },
    { icon: faMessage, text: 'Book a bed or message the owner directly' },
];

interface HostelPaywallProps {
    returnTo?: string;
}

export default function HostelPaywall({ returnTo }: HostelPaywallProps) {
    return (
        <div className="border border-[#E0D9CF] rounded-sm bg-white p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto w-11 h-11 rounded-full bg-[#EEE9E0] flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-[#1E3A5F]" />
            </div>
            <div>
                <h2 className="font-serif text-lg text-[#1A1A1E]">Subscribe to see the rest</h2>
                <p className="text-sm text-[#6B6B78] mt-1 max-w-sm mx-auto">
                    A subscription unlocks full details on every hostel on HostelFind.
                </p>
            </div>
            <ul className="text-left max-w-xs mx-auto space-y-2.5">
                {UNLOCKS.map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[#1A1A1E]">
                        <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 text-[#C49A2A] shrink-0" />
                        {item.text}
                    </li>
                ))}
            </ul>
            <Link
                href={returnTo ? `/student/subscribe?returnTo=${encodeURIComponent(returnTo)}` : '/student/subscribe'}
                className="inline-block bg-[#1E3A5F] text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-[#162d4a] transition-colors"
            >
                View subscription plans
            </Link>
        </div>
    );
}