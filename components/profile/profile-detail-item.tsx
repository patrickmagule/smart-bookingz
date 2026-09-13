import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ProfileDetailItemProps = {
  icon: LucideIcon;
  children: ReactNode;
};

export function ProfileDetailItem({ icon: Icon, children }: ProfileDetailItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-slate-400" />
      <span>{children}</span>
    </div>
  );
}
