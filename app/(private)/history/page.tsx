"use client";

import { QRScanLog, useQRScan } from "@/hooks/use-qr-scan";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  MILITARY_PERSONNEL: "Quân nhân",
  CITIZEN: "Người dân",
};

const STATUS_COLOR: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  DONG_Y: "success",
  DANG_XU_LY: "warning",
  TU_CHOI: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  DONG_Y: "Đồng ý",
  DANG_XU_LY: "Đang xử lý",
  TU_CHOI: "Từ chối",
};

function getName(log: QRScanLog): string {
  const p = log.payload ?? {};
  return p.fullName ?? p.name ?? "—";
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

interface RejectModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  logId: string | null;
  onSuccess: () => void;
}

function RejectModal({ isOpen, onOpenChange, logId, onSuccess }: RejectModalProps) {
  const { rejectQRScan } = useQRScan();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (onClose: () => void) => {
    if (!logId) return;
    try {
      setIsSubmitting(true);
      await rejectQRScan(logId, reason || undefined);
      setReason("");
      onClose();
      onSuccess();
    } catch {
      // toast handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Từ chối vào cổng</ModalHeader>
            <ModalBody>
              <Textarea
                label="Lý do từ chối (không bắt buộc)"
                placeholder="Nhập lý do..."
                value={reason}
                onValueChange={setReason}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                color="danger"
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onClose)}
              >
                Từ chối
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { getQRScanLogs, approveQRScan } = useQRScan();
  const [logs, setLogs] = useState<QRScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetId, setTargetId] = useState<string | null>(null);
  const rejectModal = useDisclosure();

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getQRScanLogs({ page: 0, size: 50 });
      // API trả về { data: QRScanLog[] | { content: QRScanLog[] } }
      const payload = (res as any)?.data;
      const items: QRScanLog[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : [];
      setLogs(items);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [getQRScanLogs]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleApprove = async (id: string) => {
    try {
      await approveQRScan(id);
      loadLogs();
    } catch {
      // toast handled in hook
    }
  };

  const openReject = (id: string) => {
    setTargetId(id);
    rejectModal.onOpen();
  };

  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Lịch sử ra vào cổng</h1>
        <Button variant="flat" onPress={loadLogs}>
          Làm mới
        </Button>
      </div>

      <Table aria-label="Lịch sử quét QR">
        <TableHeader>
          <TableColumn>STT</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>LOẠI</TableColumn>
          <TableColumn>THỜI GIAN QUÉT</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>LÝ DO</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : logs.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={7}>
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              )
              : logs.map((log, i) => (
                  <TableRow key={log.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{getName(log)}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={log.type === "MILITARY_PERSONNEL" ? "primary" : "default"}
                        variant="flat"
                      >
                        {TYPE_LABEL[log.type] ?? log.type}
                      </Chip>
                    </TableCell>
                    <TableCell>{formatTime(log.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={STATUS_COLOR[log.status] ?? "default"}
                        variant="flat"
                      >
                        {STATUS_LABEL[log.status] ?? log.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{log.reason ?? "—"}</TableCell>
                    <TableCell>
                      {log.type === "CITIZEN" && log.status === "DANG_XU_LY" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleApprove(log.id)}
                          >
                            Đồng ý
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => openReject(log.id)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      <RejectModal
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
        logId={targetId}
        onSuccess={loadLogs}
      />
    </div>
  );
}
