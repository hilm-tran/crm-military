"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@heroui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Tổng quan",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/scan", label: "Quét QR cổng", icon: "📷" },
    ],
  },
  {
    title: "Quân nhân",
    items: [
      { href: "/soldiers", label: "Danh sách quân nhân", icon: "👤" },
    ],
  },
  {
    title: "Nghỉ phép",
    items: [
      { href: "/requests", label: "Đơn nghỉ phép", icon: "📋" },
    ],
  },
  {
    title: "Lịch sử",
    items: [
      { href: "/history", label: "Lịch sử ra vào", icon: "🕐" },
    ],
  },
  {
    title: "Cấu hình hệ thống",
    items: [
      { href: "/regions", label: "Quân khu", icon: "🗺️" },
      { href: "/units", label: "Đơn vị", icon: "🏢" },
      { href: "/submission-groups", label: "Nhóm trình", icon: "👥" },
      { href: "/submission-flows", label: "Luồng trình", icon: "🔀" },
      { href: "/leave-approval-configs", label: "Cấu hình phê duyệt", icon: "⚙️" },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <div className="w-64 min-h-screen flex flex-col bg-blue-900 text-white">
      <div className="p-5 border-b border-blue-800">
        <h1 className="text-xl font-bold">Military Gate</h1>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="px-5 mb-1 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white font-medium"
                      : "text-blue-100 hover:bg-blue-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <Button color="danger" className="w-full" onPress={handleSignOut}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
