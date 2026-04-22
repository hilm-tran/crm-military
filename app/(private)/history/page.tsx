"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { LeaveRequest, useLeaveRequest } from "@/hooks/use-leave-request";
import {
  Button,
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
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Lịch sử ra vào cổng</h1>

      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button variant="flat" onPress={loadData}>Làm mới</Button>
      </div>

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
                  <TableCell className="text-center text-gray-400 py-8" colSpan={8}>
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
  );
}
