"use client";

import { CookieNames } from "@/types/global.enum";
import { Avatar, Button, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/soldiers": "Danh sách quân nhân",
  "/add-soldier": "Thêm quân nhân",
  "/requests": "Quản lý nghỉ phép",
  "/history": "Lịch sử ra vào",
  "/scan": "Quét QR cổng",
  "/units": "Quản lý đơn vị",
  "/submission-groups": "Nhóm trình",
  "/submission-flows": "Luồng trình",
  "/leave-approval-configs": "Cấu hình phê duyệt",
};

const ROLE_LABEL: Record<string, { label: string; color: "primary" | "warning" | "success" | "default" }> = {
  ROLE_SYSTEM_ADMIN: { label: "System Admin", color: "primary" },
  ROLE_ADMIN_UNIT: { label: "Quản lý đơn vị", color: "success" },
  ROLE_USER: { label: "Quân nhân", color: "default" },
  ROLE_MODERATOR: { label: "Moderator", color: "default" },
};

function getSession() {
  try {
    const raw = Cookies.get(CookieNames.Session);
    if (!raw) return null;
    return JSON.parse(raw) as {
      token: string;
      type: string;
      id: string;
      username: string;
      email: string;
      roles: string[];
    };
  } catch {
    return null;
  }
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  useEffect(() => { setSession(getSession()); }, []);
  const user = session;
  const primaryRole = user?.roles?.[0];
  const roleConfig = primaryRole ? ROLE_LABEL[primaryRole] : null;
  const pageTitle = PAGE_TITLES[pathname] ?? "Military Manager";

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="flex items-center justify-between gap-3 px-3 sm:px-6 py-3.5 bg-content1 border-b border-divider shrink-0">
      {/* Page title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          isIconOnly
          aria-label="Mở menu"
          className="shrink-0 lg:hidden"
          size="sm"
          variant="light"
          onPress={onMenuClick}
        >
          <Icon className="text-xl" icon="mdi:menu" />
        </Button>
        <h2 className="truncate text-base sm:text-lg font-semibold text-foreground">
          {pageTitle}
        </h2>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-default-500">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
          Hệ thống hoạt động
        </span>
      </div>

      {/* User info */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {roleConfig && (
          <Chip className="hidden sm:flex" size="sm" color={roleConfig.color} variant="flat">
            {roleConfig.label}
          </Chip>
        )}
        <Divider orientation="vertical" className="hidden sm:block h-8" />
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-medium text-foreground">
            {user?.username ?? "—"}
          </p>
          <p className="text-xs text-default-400">{user?.email ?? ""}</p>
        </div>
        <Avatar
          name={initials}
          size="sm"
          color="primary"
          isBordered
        />
      </div>
    </header>
  );
}
