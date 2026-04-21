"use client";

import { CookieNames } from "@/types/global.enum";
import { Avatar, Chip } from "@heroui/react";
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
  "/regions": "Quản lý quân khu",
  "/units": "Quản lý đơn vị",
  "/submission-groups": "Nhóm trình",
  "/submission-flows": "Luồng trình",
  "/leave-approval-configs": "Cấu hình phê duyệt",
};

const ROLE_LABEL: Record<string, { label: string; color: "primary" | "warning" | "success" | "default" }> = {
  ROLE_SYSTEM_ADMIN: { label: "System Admin", color: "primary" },
  ROLE_ADMIN_REGION: { label: "Quản lý quân khu", color: "warning" },
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
      user?: { id: string; username: string; email: string; roles: string[] };
    };
  } catch {
    return null;
  }
}

export default function Header() {
  const pathname = usePathname();

  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  useEffect(() => { setSession(getSession()); }, []);
  const user = session?.user;
  const primaryRole = user?.roles?.[0];
  const roleConfig = primaryRole ? ROLE_LABEL[primaryRole] : null;
  const pageTitle = PAGE_TITLES[pathname] ?? "Military Manager";

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shrink-0 shadow-sm">
      {/* Page title */}
      <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>

      {/* User info */}
      <div className="flex items-center gap-3">
        {roleConfig && (
          <Chip size="sm" color={roleConfig.color} variant="flat">
            {roleConfig.label}
          </Chip>
        )}
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-gray-800">
            {user?.username ?? "—"}
          </p>
          <p className="text-xs text-gray-400">{user?.email ?? ""}</p>
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
