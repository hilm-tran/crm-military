"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { LeaveApprovalConfig, useLeaveApprovalConfig } from "@/hooks/use-leave-approval-config";
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
  Pagination,
  Select,
  SelectItem,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useCallback, useEffect, useState } from "react";

// Danh sách chức vụ từ EMilitaryPosition (backend enum)
const MILITARY_POSITIONS = [
  { code: "TRUONG_TIEU_DOI", name: "Trưởng tiểu đội" },
  { code: "TRUONG_TRUNG_DOI", name: "Trưởng trung đội" },
  { code: "TRUONG_DAI_DOI", name: "Trưởng đại đội" },
  { code: "TRUONG_TIEU_DOAN", name: "Trưởng tiểu đoàn" },
  { code: "TRUONG_TRUNG_DOAN", name: "Trưởng trung đoàn" },
  { code: "TRUONG_LU_DOAN", name: "Trưởng lữ đoàn" },
  { code: "CHINH_TRI_VIEN", name: "Chính trị viên" },
  { code: "TRUONG_PHONG", name: "Trưởng phòng" },
  { code: "PHO_CHI_HUY", name: "Phó chỉ huy" },
  { code: "CHI_HUY_TRUONG", name: "Chỉ huy trưởng" },
];

function positionLabel(code: string) {
  return MILITARY_POSITIONS.find((p) => p.code === code)?.name ?? code;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: LeaveApprovalConfig | null;
  onSuccess: () => void;
}

function ConfigFormModal({ isOpen, onOpenChange, editing, onSuccess }: FormModalProps) {
  const { createConfig, updateConfig } = useLeaveApprovalConfig();
  const [position, setPosition] = useState<Set<string>>(new Set());
  const [maxDays, setMaxDays] = useState(5);
  const [effectiveFrom, setEffectiveFrom] = useState<CalendarDate | null>(null);
  const [effectiveTo, setEffectiveTo] = useState<CalendarDate | null>(null);
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPosition(editing?.militaryPosition ? new Set([editing.militaryPosition]) : new Set());
      setMaxDays(editing?.maxApprovalDays ?? 5);
      setEffectiveFrom(editing?.effectiveFrom ? parseDate(editing.effectiveFrom.slice(0, 10)) : null);
      setEffectiveTo(editing?.effectiveTo ? parseDate(editing.effectiveTo.slice(0, 10)) : null);
      setActive(editing?.active ?? true);
    }
  }, [isOpen, editing]);

  const selectedPosition = Array.from(position)[0] ?? "";
  const isValid = selectedPosition && maxDays > 0 && effectiveFrom && effectiveTo;

  const handleSubmit = async (onClose: () => void) => {
    if (!isValid) return;
    try {
      setIsSubmitting(true);
      const payload = {
        militaryPosition: selectedPosition,
        maxApprovalDays: maxDays,
        effectiveFrom: effectiveFrom!.toString(),
        effectiveTo: effectiveTo!.toString(),
        active,
      };
      if (editing) {
        await updateConfig({ id: editing.id, ...payload });
      } else {
        await createConfig(payload);
      }
      onClose();
      onSuccess();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{editing ? "Sửa cấu hình" : "Thêm cấu hình phê duyệt"}</ModalHeader>
            <ModalBody className="gap-3">
              <Select
                label="Chức vụ"
                placeholder="Chọn chức vụ"
                selectedKeys={position}
                onSelectionChange={(keys) => setPosition(keys as Set<string>)}
                isRequired
                isDisabled={!!editing}
              >
                {MILITARY_POSITIONS.map((p) => (
                  <SelectItem key={p.code}>{p.name}</SelectItem>
                ))}
              </Select>
              <NumberInput
                label="Số ngày tối đa được duyệt"
                value={maxDays}
                onValueChange={setMaxDays}
                minValue={1}
                isRequired
              />
              <div className="flex gap-3">
                <DateInput
                  label="Hiệu lực từ"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  isRequired
                />
                <DateInput
                  label="Hiệu lực đến"
                  value={effectiveTo}
                  onChange={setEffectiveTo}
                  isRequired
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch isSelected={active} onValueChange={setActive} />
                <span className="text-sm">Đang áp dụng</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Hủy</Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!isValid}
                onPress={() => handleSubmit(onClose)}
              >
                {editing ? "Lưu" : "Thêm"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

interface DeleteModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  target: LeaveApprovalConfig | null;
  onSuccess: () => void;
}

function DeleteModal({ isOpen, onOpenChange, target, onSuccess }: DeleteModalProps) {
  const { deleteConfig } = useLeaveApprovalConfig();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    if (!target) return;
    try {
      setIsDeleting(true);
      await deleteConfig(target.id);
      onClose();
      onSuccess();
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Xóa cấu hình</ModalHeader>
            <ModalBody>
              <p>Xóa cấu hình phê duyệt cho <strong>{positionLabel(target?.militaryPosition ?? "")}</strong>?</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Hủy</Button>
              <Button color="danger" isLoading={isDeleting} onPress={() => handleDelete(onClose)}>Xóa</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function LeaveApprovalConfigsPage() {
  const { getConfigs, toggleConfigActive } = useLeaveApprovalConfig();
  const [configs, setConfigs] = useState<LeaveApprovalConfig[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<LeaveApprovalConfig | null>(null);
  const [deleting, setDeleting] = useState<LeaveApprovalConfig | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getConfigs();
      const raw = (res as any)?.data;
      const list: LeaveApprovalConfig[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      const filtered = debouncedKeyword
        ? list.filter((c) =>
            positionLabel(c.militaryPosition).toLowerCase().includes(debouncedKeyword.toLowerCase())
          )
        : list;
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
      setConfigs(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } catch {
      setConfigs([]);
    } finally {
      setIsLoading(false);
    }
  }, [getConfigs, debouncedKeyword, page]);

  useEffect(() => { setPage(1); }, [debouncedKeyword]);
  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string) => {
    await toggleConfigActive(id).catch(() => {});
    load();
  };

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (c: LeaveApprovalConfig) => { setEditing(c); formModal.onOpen(); };
  const openDelete = (c: LeaveApprovalConfig) => { setDeleting(c); deleteModal.onOpen(); };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm theo chức vụ..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button color="primary" onPress={openAdd}>+ Thêm cấu hình</Button>
      </div>

      <Table
        aria-label="Danh sách cấu hình phê duyệt"
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
          <TableColumn>CHỨC VỤ</TableColumn>
          <TableColumn>SỐ NGÀY TỐI ĐA</TableColumn>
          <TableColumn>HIỆU LỰC TỪ</TableColumn>
          <TableColumn>HIỆU LỰC ĐẾN</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            : configs.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={7}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có cấu hình nào"}
                  </TableCell>
                </TableRow>
              )
              : configs.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-medium">{positionLabel(c.militaryPosition)}</TableCell>
                    <TableCell>{c.maxApprovalDays} ngày</TableCell>
                    <TableCell>{formatDate(c.effectiveFrom)}</TableCell>
                    <TableCell>{formatDate(c.effectiveTo)}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={c.active ? "success" : "default"} variant="flat">
                        {c.active ? "Đang áp dụng" : "Tạm dừng"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" color={c.active ? "warning" : "success"} onPress={() => handleToggle(c.id)}>
                          {c.active ? "Tạm dừng" : "Kích hoạt"}
                        </Button>
                        <Button size="sm" variant="flat" onPress={() => openEdit(c)}>Sửa</Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => openDelete(c)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      <ConfigFormModal
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        editing={editing}
        onSuccess={load}
      />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        target={deleting}
        onSuccess={load}
      />
    </div>
  );
}
