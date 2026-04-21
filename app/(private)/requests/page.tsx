"use client";

import {
  LeaveRequest,
  LeaveRequestHistory,
  useLeaveRequest,
} from "@/hooks/use-leave-request";
import {
  Button,
  Chip,
  DateInput,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useCallback, useEffect, useState } from "react";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  TRINH: "Đã trình",
  CHUA_XU_LY: "Chờ xử lý",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Từ chối",
  TRA_VE: "Trả về",
};

const STATUS_COLOR: Record<
  string,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  TRINH: "primary",
  CHUA_XU_LY: "warning",
  DA_DUYET: "success",
  TU_CHOI: "danger",
  TRA_VE: "danger",
};

function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="sm"
      color={STATUS_COLOR[status] ?? "default"}
      variant="flat"
    >
      {STATUS_LABEL[status] ?? status}
    </Chip>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

// ─── Create modal ────────────────────────────────────────────────────────────

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
}

function CreateLeaveModal({ isOpen, onOpenChange, onSuccess }: CreateModalProps) {
  const { createLeaveRequest } = useLeaveRequest();
  const [personnelId, setPersonnelId] = useState("");
  const [leaveFrom, setLeaveFrom] = useState<CalendarDate | null>(null);
  const [leaveTo, setLeaveTo] = useState<CalendarDate | null>(null);
  const [allowedOutCount, setAllowedOutCount] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (onClose: () => void) => {
    if (!personnelId || !leaveFrom || !leaveTo) return;
    try {
      setIsSubmitting(true);
      await createLeaveRequest({
        militaryPersonnelId: personnelId,
        leaveFrom: leaveFrom.toString(),
        leaveTo: leaveTo.toString(),
        allowedOutCount,
        reason: reason || undefined,
      });
      setPersonnelId("");
      setLeaveFrom(null);
      setLeaveTo(null);
      setAllowedOutCount(1);
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Tạo đơn nghỉ phép</ModalHeader>
            <ModalBody className="gap-3">
              <Input
                label="Mã quân nhân (personnelId)"
                placeholder="Nhập ID quân nhân..."
                value={personnelId}
                onValueChange={setPersonnelId}
                isRequired
              />
              <div className="flex gap-3">
                <DateInput
                  label="Ngày bắt đầu"
                  value={leaveFrom}
                  onChange={setLeaveFrom}
                  isRequired
                />
                <DateInput
                  label="Ngày kết thúc"
                  value={leaveTo}
                  onChange={setLeaveTo}
                  isRequired
                />
              </div>
              <NumberInput
                label="Số lần được phép ra"
                value={allowedOutCount}
                onValueChange={setAllowedOutCount}
                minValue={1}
              />
              <Textarea
                label="Lý do (không bắt buộc)"
                placeholder="Nhập lý do nghỉ..."
                value={reason}
                onValueChange={setReason}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!personnelId || !leaveFrom || !leaveTo}
                onPress={() => handleSubmit(onClose)}
              >
                Tạo đơn
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Approve modal ───────────────────────────────────────────────────────────

interface ApproveModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  requestId: string | null;
  onSuccess: () => void;
}

function ApproveModal({ isOpen, onOpenChange, requestId, onSuccess }: ApproveModalProps) {
  const { approveLeaveRequest } = useLeaveRequest();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (onClose: () => void) => {
    if (!requestId) return;
    try {
      setIsSubmitting(true);
      await approveLeaveRequest(requestId, reason ? { reason } : undefined);
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
            <ModalHeader>Duyệt đơn</ModalHeader>
            <ModalBody>
              <Textarea
                label="Ghi chú (không bắt buộc)"
                placeholder="Nhập ghi chú khi duyệt..."
                value={reason}
                onValueChange={setReason}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                color="success"
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onClose)}
              >
                Xác nhận duyệt
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Return modal ────────────────────────────────────────────────────────────

interface ReturnModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  requestId: string | null;
  onSuccess: () => void;
}

function ReturnModal({ isOpen, onOpenChange, requestId, onSuccess }: ReturnModalProps) {
  const { returnLeaveRequest } = useLeaveRequest();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (onClose: () => void) => {
    if (!requestId || !reason.trim()) return;
    try {
      setIsSubmitting(true);
      await returnLeaveRequest(requestId, { reason });
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
            <ModalHeader>Trả về đơn</ModalHeader>
            <ModalBody>
              <Textarea
                label="Lý do trả về"
                placeholder="Nhập lý do trả về (bắt buộc)..."
                value={reason}
                onValueChange={setReason}
                isRequired
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                color="danger"
                isLoading={isSubmitting}
                isDisabled={!reason.trim()}
                onPress={() => handleSubmit(onClose)}
              >
                Trả về
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Detail + History modal ──────────────────────────────────────────────────

interface DetailModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  request: LeaveRequest | null;
}

function DetailModal({ isOpen, onOpenChange, request }: DetailModalProps) {
  const { getLeaveRequestHistories } = useLeaveRequest();
  const [histories, setHistories] = useState<LeaveRequestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !request) return;
    setIsLoading(true);
    getLeaveRequestHistories(request.id)
      .then((res: any) => setHistories(res?.data ?? []))
      .catch(() => setHistories([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, request, getLeaveRequestHistories]);

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Chi tiết đơn nghỉ phép</ModalHeader>
            <ModalBody className="gap-4">
              {/* Request info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Thời gian nghỉ:</span>
                  <p className="font-medium">
                    {formatDate(request.leaveFrom)} → {formatDate(request.leaveTo)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <div className="mt-1">
                    <StatusChip status={request.status} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Số lần được phép ra:</span>
                  <p className="font-medium">{request.allowedOutCount}</p>
                </div>
                <div>
                  <span className="text-gray-500">Số lần đã ra:</span>
                  <p className="font-medium">{request.usedOutCount ?? 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Vòng hiện tại:</span>
                  <p className="font-medium">{request.currentRound}</p>
                </div>
                <div>
                  <span className="text-gray-500">Người duyệt hiện tại:</span>
                  <p className="font-medium">{request.currentAssignee}</p>
                </div>
              </div>

              {/* History timeline */}
              <div>
                <p className="font-semibold mb-2">Lịch sử duyệt</p>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 rounded" />
                    ))}
                  </div>
                ) : histories.length === 0 ? (
                  <p className="text-gray-400 text-sm">Chưa có lịch sử</p>
                ) : (
                  <div className="relative pl-4 border-l-2 border-gray-200 space-y-4">
                    {histories.map((h) => (
                      <div key={h.id} className="relative">
                        <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              Round {h.round} — {h.assignee}
                            </span>
                            <StatusChip status={h.status} />
                          </div>
                          {h.reason && (
                            <p className="text-gray-500 italic">"{h.reason}"</p>
                          )}
                          {h.createdAt && (
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(h.createdAt).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function RequestPage() {
  const {
    getMyLeaveRequests,
    getPendingLeaveRequests,
    acceptLeaveRequest,
    resubmitLeaveRequest,
    supplementLeaveRequest,
    submitNextLeaveRequest,
  } = useLeaveRequest();

  const [tab, setTab] = useState<"my" | "pending">("pending");
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);

  const detailModal = useDisclosure();
  const approveModal = useDisclosure();
  const returnModal = useDisclosure();
  const createModal = useDisclosure();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [myRes, pendingRes] = await Promise.allSettled([
        getMyLeaveRequests(),
        getPendingLeaveRequests(),
      ]);
      if (myRes.status === "fulfilled") {
        const myRaw = (myRes.value as any)?.data;
        setMyRequests(Array.isArray(myRaw) ? myRaw : myRaw?.content ?? []);
      }
      if (pendingRes.status === "fulfilled") {
        const pendingRaw = (pendingRes.value as any)?.data;
        setPendingRequests(Array.isArray(pendingRaw) ? pendingRaw : pendingRaw?.content ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getMyLeaveRequests, getPendingLeaveRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = (req: LeaveRequest) => {
    setSelectedRequest(req);
    detailModal.onOpen();
  };

  const openApprove = (id: string) => {
    setActionTargetId(id);
    approveModal.onOpen();
  };

  const openReturn = (id: string) => {
    setActionTargetId(id);
    returnModal.onOpen();
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptLeaveRequest(id);
      loadData();
    } catch {
      // toast handled in hook
    }
  };

  const handleSubmitNext = async (id: string) => {
    try {
      await submitNextLeaveRequest(id);
      loadData();
    } catch {
      // toast handled in hook
    }
  };

  const handleResubmit = async (id: string) => {
    try {
      await resubmitLeaveRequest(id);
      loadData();
    } catch {
      // toast handled in hook
    }
  };

  const handleSupplement = async (req: LeaveRequest) => {
    try {
      await supplementLeaveRequest(req.id, {
        leaveFrom: req.leaveFrom,
        leaveTo: req.leaveTo,
        allowedOutCount: req.allowedOutCount,
      });
      loadData();
    } catch {
      // toast handled in hook
    }
  };

  const skeletonRows = Array.from({ length: 4 });

  // ── Pending table ──────────────────────────────────────────────────────────
  const PendingTable = () => (
    <Table aria-label="Đơn chờ duyệt">
      <TableHeader>
        <TableColumn>STT</TableColumn>
        <TableColumn>NHÂN SỰ</TableColumn>
        <TableColumn>THỜI GIAN</TableColumn>
        <TableColumn>SỐ LẦN RA</TableColumn>
        <TableColumn>VÒNG</TableColumn>
        <TableColumn>TRẠNG THÁI</TableColumn>
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
          : pendingRequests.length === 0
            ? (
              <TableRow>
                <TableCell className="text-center text-gray-400 py-8" colSpan={7}>
                  Không có đơn chờ duyệt
                </TableCell>
              </TableRow>
            )
            : pendingRequests.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {(req as any).militaryPersonnel?.fullName ?? req.militaryPersonnelId}
                  </TableCell>
                  <TableCell>
                    {formatDate(req.leaveFrom)} → {formatDate(req.leaveTo)}
                  </TableCell>
                  <TableCell>{req.allowedOutCount}</TableCell>
                  <TableCell>{req.currentRound}</TableCell>
                  <TableCell>
                    <StatusChip status={req.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => openDetail(req)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        color="default"
                        variant="flat"
                        onPress={() => handleAccept(req.id)}
                      >
                        Tiếp nhận
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => openApprove(req.id)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => openReturn(req.id)}
                      >
                        Trả về
                      </Button>
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        onPress={() => handleSubmitNext(req.id)}
                      >
                        Trình tiếp
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
      </TableBody>
    </Table>
  );

  // ── My requests table ──────────────────────────────────────────────────────
  const MyTable = () => (
    <Table aria-label="Đơn của tôi">
      <TableHeader>
        <TableColumn>STT</TableColumn>
        <TableColumn>THỜI GIAN</TableColumn>
        <TableColumn>SỐ LẦN RA / ĐÃ RA</TableColumn>
        <TableColumn>VÒNG</TableColumn>
        <TableColumn>TRẠNG THÁI</TableColumn>
        <TableColumn>HÀNH ĐỘNG</TableColumn>
      </TableHeader>
      <TableBody>
        {isLoading
          ? skeletonRows.map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : myRequests.length === 0
            ? (
              <TableRow>
                <TableCell className="text-center text-gray-400 py-8" colSpan={6}>
                  Chưa có đơn nào
                </TableCell>
              </TableRow>
            )
            : myRequests.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {formatDate(req.leaveFrom)} → {formatDate(req.leaveTo)}
                  </TableCell>
                  <TableCell>
                    {req.allowedOutCount} / {req.usedOutCount ?? 0}
                  </TableCell>
                  <TableCell>{req.currentRound}</TableCell>
                  <TableCell>
                    <StatusChip status={req.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => openDetail(req)}
                      >
                        Chi tiết
                      </Button>
                      {req.status === "TRA_VE" && (
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleResubmit(req.id)}
                        >
                          Trình lại
                        </Button>
                      )}
                      {req.status === "DA_DUYET" && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={() => handleSupplement(req)}
                        >
                          Bổ sung
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Quản lý nghỉ phép</h1>
        <Button color="primary" onPress={createModal.onOpen}>
          + Tạo đơn nghỉ phép
        </Button>
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(k) => setTab(k as "my" | "pending")}
      >
        <Tab key="pending" title={`Chờ tôi duyệt (${pendingRequests.length})`}>
          <PendingTable />
        </Tab>
        <Tab key="my" title={`Đơn của tôi (${myRequests.length})`}>
          <MyTable />
        </Tab>
      </Tabs>

      {/* Modals */}
      <CreateLeaveModal
        isOpen={createModal.isOpen}
        onOpenChange={createModal.onOpenChange}
        onSuccess={loadData}
      />
      <DetailModal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        request={selectedRequest}
      />
      <ApproveModal
        isOpen={approveModal.isOpen}
        onOpenChange={approveModal.onOpenChange}
        requestId={actionTargetId}
        onSuccess={loadData}
      />
      <ReturnModal
        isOpen={returnModal.isOpen}
        onOpenChange={returnModal.onOpenChange}
        requestId={actionTargetId}
        onSuccess={loadData}
      />
    </div>
  );
}
