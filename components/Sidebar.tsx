"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { navigate } from "@/lib/routes/routes.util";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Tổng quan",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "mdi:view-dashboard-outline",
      },
      { href: "/scan", label: "Quét QR cổng", icon: "mdi:qrcode-scan" },
    ],
  },
  {
    title: "Quân nhân",
    items: [
      {
        href: "/soldiers",
        label: "Danh sách quân nhân",
        icon: "mdi:shield-account-outline",
      },
      { href: "/vehicles", label: "Phương tiện", icon: "mdi:car-outline" },
    ],
  },
  {
    title: "Nghỉ phép",
    items: [
      {
        href: "/requests",
        label: "Đơn nghỉ phép",
        icon: "mdi:file-document-edit-outline",
      },
    ],
  },
  {
    title: "Lịch sử",
    items: [{ href: "/history", label: "Lịch sử ra vào", icon: "mdi:history" }],
  },
  {
    title: "Cấu hình hệ thống",
    items: [
      {
        href: "/units",
        label: "Đơn vị",
        icon: "mdi:office-building-marker-outline",
      },
      {
        href: "/submission-groups",
        label: "Nhóm trình",
        icon: "mdi:account-multiple-outline",
      },
      {
        href: "/submission-flows",
        label: "Luồng trình",
        icon: "mdi:sitemap-outline",
      },
      {
        href: "/leave-approval-configs",
        label: "Cấu hình phê duyệt",
        icon: "mdi:cog-outline",
      },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace(navigate("/login"));
  };

  return (
    <div className="relative w-72 min-h-screen flex flex-col bg-gradient-to-b from-[#20281a] to-[#14170f] text-white shrink-0">
      {/* Brand */}
      <div className="relative overflow-hidden border-b border-white/10 bg-tactical-grid">
        <div className="relative flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-secondary-400/40 bg-white/5">
            <Icon
              className="text-2xl text-secondary-400"
              icon="mdi:shield-star-outline"
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">
              MILITARY MANAGER
            </h1>
            <p className="text-[11px] text-white/50 tracking-wide">
              Hệ thống quản lý doanh trại
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto py-4 scrollbar-thin-olive">
        {NAV_GROUPS.map((group, idx) => (
          <div
            key={group.title}
            className={`px-3 pb-3 ${idx > 0 ? "mt-2 pt-3 border-t border-white/[0.06]" : ""}`}
          >
            <p className="px-2 mb-1.5 text-[11px] font-semibold text-secondary-400/80 uppercase tracking-wider">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                    href={item.href}
                  >
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-secondary-400 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <Icon
                      className={`text-lg shrink-0 ${isActive ? "text-secondary-400" : "text-white/50 group-hover:text-white/80"}`}
                      icon={item.icon}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          className="w-full border-1 border-danger-400/40 text-danger-300"
          color="danger"
          startContent={<Icon icon="mdi:logout" />}
          variant="flat"
          onPress={handleSignOut}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
