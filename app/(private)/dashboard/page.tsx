"use client";

import { Card, Select, SelectItem, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSoldier } from "@/hooks/use-soldier";
import { useLeaveRequest } from "@/hooks/use-leave-request";

interface DashboardStats {
  totalSoldiers: number;
  pendingLeaveRequests: number;
}

type Period = "nam" | "thang" | "tuan" | "ngay";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "nam", label: "Theo năm" },
  { key: "thang", label: "Theo tháng" },
  { key: "tuan", label: "Theo tuần" },
  { key: "ngay", label: "Theo ngày" },
];

// TODO: replace with real backend statistics endpoint (số lượt ra/vào theo đơn vị).
// Mock data — dựng UI trước, chờ BE bổ sung API.
const MOCK_CHART: Record<Period, { unit: string; ra: number; vao: number }[]> =
  {
    nam: [
      { unit: "Tiểu đoàn 1", ra: 1240, vao: 1198 },
      { unit: "Tiểu đoàn 2", ra: 980, vao: 951 },
      { unit: "Tiểu đoàn 3", ra: 1105, vao: 1080 },
      { unit: "Tiểu đoàn 4", ra: 720, vao: 705 },
    ],
    thang: [
      { unit: "Tiểu đoàn 1", ra: 118, vao: 112 },
      { unit: "Tiểu đoàn 2", ra: 92, vao: 88 },
      { unit: "Tiểu đoàn 3", ra: 104, vao: 99 },
      { unit: "Tiểu đoàn 4", ra: 67, vao: 64 },
    ],
    tuan: [
      { unit: "Tiểu đoàn 1", ra: 32, vao: 30 },
      { unit: "Tiểu đoàn 2", ra: 24, vao: 22 },
      { unit: "Tiểu đoàn 3", ra: 28, vao: 27 },
      { unit: "Tiểu đoàn 4", ra: 15, vao: 15 },
    ],
    ngay: [
      { unit: "Tiểu đoàn 1", ra: 6, vao: 5 },
      { unit: "Tiểu đoàn 2", ra: 4, vao: 4 },
      { unit: "Tiểu đoàn 3", ra: 5, vao: 5 },
      { unit: "Tiểu đoàn 4", ra: 3, vao: 3 },
    ],
  };

export default function DashboardPage() {
  const { getSoldiers } = useSoldier();
  const { getPendingLeaveRequests } = useLeaveRequest();
  const [stats, setStats] = useState<DashboardStats>({
    totalSoldiers: 0,
    pendingLeaveRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("thang");

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
            ? (soldiersRes.value?.data?.totalElements ?? 0)
            : 0;

        const pendingLeaveRequests =
          pendingRes.status === "fulfilled"
            ? ((pendingRes.value as any)?.data?.totalElements ?? 0)
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

  // TODO: số trong/ngoài doanh trại nên lấy từ endpoint thống kê của BE.
  // Tạm thời: mock — mặc định toàn bộ đang trong doanh trại.
  const outBarracks = 0;
  const inBarracks = Math.max(stats.totalSoldiers - outBarracks, 0);

  const chartData = useMemo(() => MOCK_CHART[period], [period]);

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
            color === "primary"
              ? "bg-primary-100 text-primary-600"
              : "bg-secondary-100 text-secondary-600"
          }`}
        >
          <Icon className="text-xl" icon={icon} />
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
        <p className="text-sm text-default-500">
          Tổng quan quân số &amp; nghỉ phép
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          color="primary"
          description="Tổng số quân nhân trong hệ thống"
          icon="mdi:shield-account-outline"
          label="Tổng quân nhân"
          value={stats.totalSoldiers}
        />

        {/* Card trong/ngoài doanh trại */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm text-default-500 mb-2">Quân số doanh trại</p>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <Icon className="text-xl" icon="mdi:home-group" />
            </div>
          </div>
          <div className="flex items-end gap-8">
            <div>
              <p className="text-xs text-default-400">Trong doanh trại</p>
              {isLoading ? (
                <Skeleton className="w-12 h-8 rounded mt-1" />
              ) : (
                <h2 className="text-3xl font-bold text-success-600">
                  {inBarracks}
                </h2>
              )}
            </div>
            <div>
              <p className="text-xs text-default-400">Ngoài doanh trại</p>
              {isLoading ? (
                <Skeleton className="w-12 h-8 rounded mt-1" />
              ) : (
                <h2 className="text-3xl font-bold text-warning-600">
                  {outBarracks}
                </h2>
              )}
            </div>
          </div>
        </Card>

        <StatCard
          color="secondary"
          description="Số yêu cầu nghỉ phép đang chờ bạn xử lý"
          icon="mdi:file-clock-outline"
          label="Yêu cầu chờ duyệt"
          value={stats.pendingLeaveRequests}
        />
      </div>

      {/* Biểu đồ thống kê số lượt ra vào */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Thống kê số lượt ra vào
            </h2>
            <p className="text-xs text-default-400">
              Số liệu mô phỏng theo đơn vị
            </p>
          </div>
          <Select
            aria-label="Khoảng thời gian"
            className="w-40"
            selectedKeys={new Set([period])}
            size="sm"
            variant="bordered"
            onSelectionChange={(keys) =>
              setPeriod((Array.from(keys)[0] as Period) ?? "thang")
            }
          >
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="unit" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="ra"
                fill="#f59e0b"
                name="Lượt ra"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="vao"
                fill="#16a34a"
                name="Lượt vào"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
