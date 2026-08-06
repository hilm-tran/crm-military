"use client";

import {
  Button,
  Card,
  Chip,
  Pagination,
  Select,
  SelectItem,
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

import { QRScanLog, useQRScan } from "@/hooks/use-qr-scan";
import { resolveImageUrl } from "@/lib/image-url";
import { PageHeader } from "@/components/PageHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  DONG_Y: "success",
  TU_CHOI: "danger",
  DANG_XU_LY: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  DONG_Y: "Đồng ý",
  TU_CHOI: "Từ chối",
  DANG_XU_LY: "Đang xử lý",
};

const SCAN_TYPE_LABEL: Record<string, string> = {
  MILITARY: "Quân nhân",
  CITIZEN: "Người dân",
};

const STATUS_OPTIONS = [
  { key: "", label: "Tất cả trạng thái" },
  { key: "DONG_Y", label: "Đồng ý" },
  { key: "TU_CHOI", label: "Từ chối" },
  { key: "DANG_XU_LY", label: "Đang xử lý" },
];

const SCAN_TYPE_OPTIONS = [
  { key: "", label: "Tất cả đối tượng" },
  { key: "MILITARY", label: "Quân nhân" },
  { key: "CITIZEN", label: "Người dân" },
];

function formatDateTime(iso?: string) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("vi-VN");
}

function subjectName(log: QRScanLog) {
  return log.militaryPersonnelFullName ?? log.citizenName ?? "—";
}

function subjectSub(log: QRScanLog) {
  return log.militaryPersonnelCode ?? log.citizenId ?? "";
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { getQRScanLogs } = useQRScan();
  const [logs, setLogs] = useState<QRScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scanType, setScanType] = useState("");
  const [status, setStatus] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getQRScanLogs({
        scanType: (scanType || undefined) as any,
        status: (status || undefined) as any,
        page: page - 1,
        size: PAGE_SIZE,
      });
      const raw = (res as any)?.data;

      setLogs(Array.isArray(raw) ? raw : (raw?.content ?? []));
      setTotalPages(raw?.totalPages ?? 1);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [getQRScanLogs, scanType, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [scanType, status]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        icon="mdi:history"
        subtitle="Nhật ký quét QR ra/vào cổng doanh trại"
        title="Lịch sử ra vào cổng"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <Select
            aria-label="Đối tượng"
            className="w-full sm:w-44"
            selectedKeys={new Set([scanType])}
            size="sm"
            variant="bordered"
            onSelectionChange={(keys) =>
              setScanType((Array.from(keys)[0] as string) ?? "")
            }
          >
            {SCAN_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>
          <Select
            aria-label="Trạng thái"
            className="w-full sm:w-44"
            selectedKeys={new Set([status])}
            size="sm"
            variant="bordered"
            onSelectionChange={(keys) =>
              setStatus((Array.from(keys)[0] as string) ?? "")
            }
          >
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>
        </div>
        <Button
          className="w-full sm:w-auto"
          startContent={<Icon icon="mdi:refresh" />}
          variant="flat"
          onPress={loadData}
        >
          Làm mới
        </Button>
      </div>

      <div className="hidden sm:block">
        <Table
          aria-label="Lịch sử ra vào"
          bottomContent={
            totalPages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>STT</TableColumn>
            <TableColumn>THỜI GIAN</TableColumn>
            <TableColumn>ĐỐI TƯỢNG</TableColumn>
            <TableColumn>LOẠI</TableColumn>
            <TableColumn>TRẠNG THÁI</TableColumn>
            <TableColumn>LÝ DO</TableColumn>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-default-400 py-8"
                  colSpan={6}
                >
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={String(log.id)}>
                  <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                  <TableCell>{formatDateTime(log.scannedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.militaryPersonnelImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={subjectName(log)}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          src={
                            resolveImageUrl(log.militaryPersonnelImageUrl) ?? ""
                          }
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {subjectName(log)}
                        </p>
                        {subjectSub(log) && (
                          <p className="text-xs text-default-400 font-mono truncate">
                            {subjectSub(log)}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {SCAN_TYPE_LABEL[log.scanType] ?? log.scanType}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={STATUS_COLOR[log.status] ?? "default"}
                      size="sm"
                      variant="flat"
                    >
                      {STATUS_LABEL[log.status] ?? log.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{log.reason ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
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
        ) : logs.length === 0 ? (
          <p className="text-center text-default-400 py-8">Chưa có dữ liệu</p>
        ) : (
          logs.map((log) => (
            <Card key={String(log.id)} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {log.militaryPersonnelImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={subjectName(log)}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      src={resolveImageUrl(log.militaryPersonnelImageUrl) ?? ""}
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{subjectName(log)}</p>
                    <p className="text-xs text-default-400">
                      {SCAN_TYPE_LABEL[log.scanType] ?? log.scanType}
                    </p>
                  </div>
                </div>
                <Chip
                  color={STATUS_COLOR[log.status] ?? "default"}
                  size="sm"
                  variant="flat"
                >
                  {STATUS_LABEL[log.status] ?? log.status}
                </Chip>
              </div>
              <div className="mt-2 text-xs text-default-500 space-y-0.5">
                <p>Thời gian: {formatDateTime(log.scannedAt)}</p>
                {log.reason && <p>Lý do: {log.reason}</p>}
              </div>
            </Card>
          ))
        )}
        {totalPages > 1 && (
          <div className="flex w-full justify-center pt-2">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
