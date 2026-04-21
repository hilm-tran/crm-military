"use client";

import { useLeaveRequest } from "@/hooks/use-leave-request";
import { useSoldier } from "@/hooks/use-soldier";
import { Card, Skeleton } from "@heroui/react";
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
            ? ((pendingRes.value as any)?.data ?? []).length
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
    color,
    description,
  }: {
    label: string;
    value: number;
    color: string;
    description?: string;
  }) => (
    <Card className="p-6">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      {isLoading ? (
        <Skeleton className="w-16 h-8 rounded" />
      ) : (
        <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
      )}
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Tổng quân nhân"
          value={stats.totalSoldiers}
          color="text-blue-600"
          description="Tổng số quân nhân trong hệ thống"
        />
        <StatCard
          label="Đơn nghỉ chờ duyệt"
          value={stats.pendingLeaveRequests}
          color="text-orange-500"
          description="Số đơn nghỉ phép đang chờ bạn xử lý"
        />
      </div>
    </div>
  );
}
