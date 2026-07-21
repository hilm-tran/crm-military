"use client";

import { useLeaveRequest } from "@/hooks/use-leave-request";
import { useSoldier } from "@/hooks/use-soldier";
import { Card, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalSoldiers: number;
  pendingLeaveRequests: number;
}

export default function DashboardPage() {
  const { getSoldiers } = useSoldier();
  const { getPendingLeaveRequests } = useLeaveRequest();
  const [stats, setStats] = useState<DashboardStats>({
    totalSoldiers: 0,
    pendingLeaveRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [soldiersRes, pendingRes] = await Promise.allSettled([
          getSoldiers({ page: 0, size: 1 }),
          getPendingLeaveRequests(),
        ]);

        const totalSoldiers =
          soldiersRes.status === "fulfilled"
            ? soldiersRes.value?.data?.totalElements ?? 0
            : 0;

        const pendingLeaveRequests =
          pendingRes.status === "fulfilled"
            ? (pendingRes.value as any)?.data?.totalElements ?? 0
            : 0;

        setStats({ totalSoldiers, pendingLeaveRequests });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [getSoldiers, getPendingLeaveRequests]);

  const StatCard = ({
    label,
    value,
    icon,
    color,
    description,
  }: {
    label: string;
    value: number;
    icon: string;
    color: "primary" | "secondary";
    description?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-default-500 mb-2">{label}</p>
          {isLoading ? (
            <Skeleton className="w-16 h-8 rounded" />
          ) : (
            <h2 className="text-3xl font-bold text-foreground">{value}</h2>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            color === "primary" ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-600"
          }`}
        >
          <Icon icon={icon} className="text-xl" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-default-400 mt-3">{description}</p>
      )}
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-default-500">Tổng quan quân số &amp; nghỉ phép</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Tổng quân nhân"
          value={stats.totalSoldiers}
          icon="mdi:shield-account-outline"
          color="primary"
          description="Tổng số quân nhân trong hệ thống"
        />
        <StatCard
          label="Đơn nghỉ chờ duyệt"
          value={stats.pendingLeaveRequests}
          icon="mdi:file-clock-outline"
          color="secondary"
          description="Số đơn nghỉ phép đang chờ bạn xử lý"
        />
      </div>
    </div>
  );
}
