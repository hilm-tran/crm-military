import { Icon } from "@iconify/react";
import { ReactNode } from "react";

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <Icon icon={icon} className="text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-default-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
