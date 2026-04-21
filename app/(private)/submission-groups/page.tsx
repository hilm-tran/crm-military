"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { SubmissionGroup, useSubmission } from "@/hooks/use-submission";
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
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: SubmissionGroup | null;
  onSuccess: () => void;
}

function GroupFormModal({ isOpen, onOpenChange, editing, onSuccess }: FormModalProps) {
  const { createGroup, updateGroup } = useSubmission();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? "");
      setDescription(editing?.description ?? "");
    }
  }, [isOpen, editing]);

  const handleSubmit = async (onClose: () => void) => {
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      if (editing) {
        await updateGroup({ id: editing.id, name, description: description || undefined });
      } else {
        await createGroup({ name, description: description || undefined });
      }
      onClose();
      onSuccess();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{editing ? "Sửa nhóm trình" : "Thêm nhóm trình"}</ModalHeader>
            <ModalBody className="gap-3">
              <Input
                label="Tên nhóm"
                placeholder="VD: Nhóm duyệt đơn vị"
                value={name}
                onValueChange={setName}
                isRequired
              />
              <Textarea
                label="Mô tả (tùy chọn)"
                placeholder="Mô tả nhóm..."
                value={description}
                onValueChange={setDescription}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Hủy</Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!name.trim()}
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

// ─── Manage users modal ───────────────────────────────────────────────────────

interface ManageUsersModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  group: SubmissionGroup | null;
  onSuccess: () => void;
}

function ManageUsersModal({ isOpen, onOpenChange, group, onSuccess }: ManageUsersModalProps) {
  const { addUserToGroup, removeUserFromGroup } = useSubmission();
  const [newUserId, setNewUserId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!group || !newUserId.trim()) return;
    try {
      setIsAdding(true);
      await addUserToGroup(group.id, newUserId.trim());
      setNewUserId("");
      onSuccess();
    } catch {
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!group) return;
    try {
      await removeUserFromGroup(group.id, userId);
      onSuccess();
    } catch {
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Quản lý thành viên — {group?.name}</ModalHeader>
            <ModalBody className="gap-4">
              {/* Current members */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Thành viên hiện tại ({group?.userIds?.length ?? 0})
                </p>
                {(group?.userIds ?? []).length === 0 ? (
                  <p className="text-gray-400 text-sm">Chưa có thành viên</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(group?.userIds ?? []).map((uid) => (
                      <Chip
                        key={uid}
                        onClose={() => handleRemove(uid)}
                        variant="flat"
                      >
                        {uid}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              {/* Add user */}
              <div className="flex gap-2">
                <Input
                  label="User ID"
                  placeholder="Nhập user ID..."
                  value={newUserId}
                  onValueChange={setNewUserId}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  isLoading={isAdding}
                  isDisabled={!newUserId.trim()}
                  onPress={handleAdd}
                  className="self-end"
                >
                  Thêm
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Đóng</Button>
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
  target: SubmissionGroup | null;
  onSuccess: () => void;
}

function DeleteModal({ isOpen, onOpenChange, target, onSuccess }: DeleteModalProps) {
  const { deleteGroup } = useSubmission();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    if (!target) return;
    try {
      setIsDeleting(true);
      await deleteGroup(target.id);
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
            <ModalHeader>Xóa nhóm trình</ModalHeader>
            <ModalBody>
              <p>Bạn có chắc muốn xóa nhóm <strong>{target?.name}</strong>?</p>
              <p className="text-sm text-orange-500">Lưu ý: không thể xóa nhóm đang được dùng trong luồng trình.</p>
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

export default function SubmissionGroupsPage() {
  const { getGroups } = useSubmission();
  const [groups, setGroups] = useState<SubmissionGroup[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<SubmissionGroup | null>(null);
  const [deleting, setDeleting] = useState<SubmissionGroup | null>(null);
  const [managing, setManaging] = useState<SubmissionGroup | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const manageModal = useDisclosure();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getGroups();
      const raw = (res as any)?.data;
      const list: SubmissionGroup[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      const filtered = debouncedKeyword
        ? list.filter((g) => g.name.toLowerCase().includes(debouncedKeyword.toLowerCase()))
        : list;
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
      setGroups(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [getGroups, debouncedKeyword, page]);

  useEffect(() => { setPage(1); }, [debouncedKeyword]);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (g: SubmissionGroup) => { setEditing(g); formModal.onOpen(); };
  const openDelete = (g: SubmissionGroup) => { setDeleting(g); deleteModal.onOpen(); };
  const openManage = (g: SubmissionGroup) => { setManaging(g); manageModal.onOpen(); };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm theo tên nhóm..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button color="primary" onPress={openAdd}>+ Thêm nhóm</Button>
      </div>

      <Table
        aria-label="Danh sách nhóm trình"
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
          <TableColumn>TÊN NHÓM</TableColumn>
          <TableColumn>MÔ TẢ</TableColumn>
          <TableColumn>SỐ THÀNH VIÊN</TableColumn>
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
            : groups.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={5}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có nhóm nào"}
                  </TableCell>
                </TableRow>
              )
              : groups.map((g, i) => (
                  <TableRow key={g.id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>{g.description ?? "—"}</TableCell>
                    <TableCell>{g.userIds?.length ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" color="primary" onPress={() => openManage(g)}>
                          Thành viên
                        </Button>
                        <Button size="sm" variant="flat" onPress={() => openEdit(g)}>Sửa</Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => openDelete(g)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      <GroupFormModal
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        editing={editing}
        onSuccess={load}
      />
      <ManageUsersModal
        isOpen={manageModal.isOpen}
        onOpenChange={manageModal.onOpenChange}
        group={managing}
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
