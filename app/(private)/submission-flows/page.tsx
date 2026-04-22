"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { SubmissionFlow, SubmissionFlowGroup, useSubmission } from "@/hooks/use-submission";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";

// ─── Flow form modal ──────────────────────────────────────────────────────────

interface GroupOption { id: string; name: string; }

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: SubmissionFlow | null;
  groups: GroupOption[];
  onSuccess: () => void;
}

function FlowFormModal({ isOpen, onOpenChange, editing, groups, onSuccess }: FormModalProps) {
  const { createFlow, updateFlow } = useSubmission();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<{ groupId: string }[]>([{ groupId: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(editing?.code ?? "");
      setName(editing?.name ?? "");
      setSteps(
        editing?.groups?.length
          ? editing.groups.map((s) => ({ groupId: String(s.groupId) }))
          : [{ groupId: "" }],
      );
    }
  }, [isOpen, editing]);

  const addStep = () => setSteps((prev) => [...prev, { groupId: "" }]);
  const removeStep = (idx: number) =>
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  const setStepGroup = (idx: number, groupId: string) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { groupId } : s)));

  const builtGroups: SubmissionFlowGroup[] = steps.map((s, i) => ({
    orderNo: i + 1,
    groupId: s.groupId,
  }));

  const isValid =
    code.trim() &&
    name.trim() &&
    steps.every((s) => s.groupId) &&
    new Set(steps.map((s) => s.groupId)).size === steps.length; // no duplicate groups

  const handleSubmit = async (onClose: () => void) => {
    if (!isValid) return;
    try {
      setIsSubmitting(true);
      if (editing) {
        await updateFlow({ id: editing.id, code, name, groups: builtGroups });
      } else {
        await createFlow({ code, name, groups: builtGroups });
      }
      onClose();
      onSuccess();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{editing ? "Sửa luồng trình" : "Thêm luồng trình"}</ModalHeader>
            <ModalBody className="gap-4">
              <Input
                label="Mã luồng (code)"
                placeholder="VD: LEAVE hoặc NGHI_PHEP"
                value={code}
                onValueChange={(v) => setCode(v.toUpperCase())}
                isRequired
                isDisabled={!!editing}
                description="Không phân biệt hoa/thường, phải là duy nhất"
              />
              <Input
                label="Tên luồng"
                placeholder="VD: Luồng phê duyệt nghỉ phép"
                value={name}
                onValueChange={setName}
                isRequired
              />

              {/* Steps */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Các bước (theo thứ tự)</p>
                  <Button size="sm" variant="flat" color="primary" onPress={addStep}>
                    + Thêm bước
                  </Button>
                </div>
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-8 text-center font-mono">
                        {idx + 1}.
                      </span>
                      <Select
                        className="flex-1"
                        placeholder="Chọn nhóm phê duyệt"
                        selectedKeys={step.groupId ? new Set([step.groupId]) : new Set()}
                        onSelectionChange={(keys) => {
                          const v = Array.from(keys)[0] as string;
                          setStepGroup(idx, v ?? "");
                        }}
                      >
                        {groups.map((g) => (
                          <SelectItem key={g.id}>{g.name}</SelectItem>
                        ))}
                      </Select>
                      {steps.length > 1 && (
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => removeStep(idx)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {new Set(steps.map((s) => s.groupId)).size !== steps.length && (
                  <p className="text-xs text-red-500 mt-1">Không được dùng trùng nhóm trong cùng luồng</p>
                )}
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
  target: SubmissionFlow | null;
  onSuccess: () => void;
}

function DeleteModal({ isOpen, onOpenChange, target, onSuccess }: DeleteModalProps) {
  const { deleteFlow } = useSubmission();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    if (!target) return;
    try {
      setIsDeleting(true);
      await deleteFlow(target.id);
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
            <ModalHeader>Xóa luồng trình</ModalHeader>
            <ModalBody>
              <p>Bạn có chắc muốn xóa luồng <strong>{target?.name}</strong>?</p>
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

export default function SubmissionFlowsPage() {
  const { getFlows, getGroups } = useSubmission();
  const [flows, setFlows] = useState<SubmissionFlow[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<SubmissionFlow | null>(null);
  const [deleting, setDeleting] = useState<SubmissionFlow | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const loadGroups = useCallback(async () => {
    const res = await getGroups().catch(() => null);
    const rawGroups = (res as any)?.data;
    const list = Array.isArray(rawGroups) ? rawGroups : rawGroups?.content ?? [];
    setGroups(list.map((g: any) => ({ id: g.id, name: g.name })));
  }, [getGroups]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getFlows();
      const raw = (res as any)?.data;
      const list: SubmissionFlow[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      const filtered = debouncedKeyword
        ? list.filter((f) =>
            f.name.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
            f.code.toLowerCase().includes(debouncedKeyword.toLowerCase())
          )
        : list;
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
      setFlows(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } catch {
      setFlows([]);
    } finally {
      setIsLoading(false);
    }
  }, [getFlows, debouncedKeyword, page]);

  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => { setPage(1); }, [debouncedKeyword]);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (f: SubmissionFlow) => { setEditing(f); formModal.onOpen(); };
  const openDelete = (f: SubmissionFlow) => { setDeleting(f); deleteModal.onOpen(); };

  const getGroupName = (groupId: string | number) =>
    groups.find((g) => g.id === String(groupId))?.name ?? String(groupId);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm theo tên, mã luồng..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button color="primary" onPress={openAdd}>+ Thêm luồng</Button>
      </div>

      <Table
        aria-label="Danh sách luồng trình"
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
          <TableColumn>CODE</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>CÁC BƯỚC</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            : flows.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={5}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có luồng nào"}
                  </TableCell>
                </TableRow>
              )
              : flows.map((f, i) => (
                  <TableRow key={f.id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">{f.code}</Chip>
                    </TableCell>
                    <TableCell>{f.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(f.groups ?? [])
                          .sort((a, b) => a.orderNo - b.orderNo)
                          .map((s) => (
                            <Chip key={s.orderNo} size="sm" variant="flat">
                              {s.orderNo}. {getGroupName(s.groupId)}
                            </Chip>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => openEdit(f)}>Sửa</Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => openDelete(f)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      <FlowFormModal
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        editing={editing}
        groups={groups}
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
