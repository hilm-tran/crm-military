"use client";

import { PageHeader } from "@/components/PageHeader";
import { useDebounce } from "@/hooks/use-debounce";
import { LeaveRequest, useLeaveRequest } from "@/hooks/use-leave-request";
import {
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "danger" | "primary"> = {
  DA_DUYET: "success",
  DANG_XU_LY: "warning",
  CHUA_XU_LY: "warning",
  TRA_VE: "danger",
  TU_CHOI: "danger",
  TRINH: "primary",
};

const STATUS_LABEL: Record<string, string> = {
  DA_DUYET: "Đã duyệt",
  DANG_XU_LY: "Đang xử lý",
  CHUA_XU_LY: "Chưa xử lý",
  TRA_VE: "Trả về",
  TU_CHOI: "Từ chối",
  TRINH: "Đã trình",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { getPendingLeaveRequests } = useLeaveRequest();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filtered, setFiltered] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPendingLeaveRequests();
      const raw = (res as any)?.data;
      const list: LeaveRequest[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      setRequests(list);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [getPendingLeaveRequests]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side filter + paginate
  useEffect(() => {
    const kw = debouncedKeyword.toLowerCase();
    const list = kw
      ? requests.filter((r) =>
          r.currentAssignee?.toLowerCase().includes(kw) ||
          r.reason?.toLowerCase().includes(kw) ||
          r.status?.toLowerCase().includes(kw)
        )
      : requests;
    setTotalPages(Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
    setFiltered(list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  }, [requests, debouncedKeyword, page]);

  useEffect(() => { setPage(1); }, [debouncedKeyword]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        icon="mdi:history"
        title="Lịch sử ra vào cổng"
        subtitle="Nhật ký xử lý đơn nghỉ phép qua cổng doanh trại"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Tìm kiếm..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button className="w-full sm:w-auto" variant="flat" onPress={loadData} startContent={<Icon icon="mdi:refresh" />}>
          Làm mới
        </Button>
      </div>

      <div className="hidden sm:block">
      <Table
        aria-label="Lịch sử ra vào"
        bottomContent={
          totalPages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination isCompact showControls showShadow color="primary" page={page} total={totalPages} onChange={setPage} />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>STT</TableColumn>
          <TableColumn>NGƯỜI XỬ LÝ</TableColumn>
          <TableColumn>NGHỈ TỪ</TableColumn>
          <TableColumn>NGHỈ ĐẾN</TableColumn>
          <TableColumn>SỐ LẦN RA</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>LÝ DO</TableColumn>
          <TableColumn>NGÀY TẠO</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            : filtered.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-default-400 py-8" colSpan={8}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
                  </TableCell>
                </TableRow>
              )
              : filtered.map((req, i) => (
                  <TableRow key={req.id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-medium">{req.currentAssignee ?? "—"}</TableCell>
                    <TableCell>{formatDate(req.leaveFrom)}</TableCell>
                    <TableCell>{formatDate(req.leaveTo)}</TableCell>
                    <TableCell>{req.usedOutCount ?? 0} / {req.allowedOutCount}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={STATUS_COLOR[req.status] ?? "default"}
                        variant="flat"
                      >
                        {STATUS_LABEL[req.status] ?? req.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{req.reason ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(req.createdAt)}</TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-full rounded" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-default-400 py-8">
            {keyword ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
          </p>
        ) : (
          filtered.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium truncate">
                  {req.currentAssignee ?? "—"}
                </p>
                <Chip
                  size="sm"
                  color={STATUS_COLOR[req.status] ?? "default"}
                  variant="flat"
                >
                  {STATUS_LABEL[req.status] ?? req.status}
                </Chip>
              </div>
              <div className="mt-2 text-xs text-default-500 space-y-0.5">
                <p>
                  Nghỉ: {formatDate(req.leaveFrom)} → {formatDate(req.leaveTo)}
                </p>
                <p>
                  Số lần ra: {req.usedOutCount ?? 0} / {req.allowedOutCount}
                </p>
                {req.reason && <p>Lý do: {req.reason}</p>}
                <p>Ngày tạo: {formatDateTime(req.createdAt)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
