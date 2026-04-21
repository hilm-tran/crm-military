"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { MilitaryRegion, useRegion } from "@/hooks/use-region";
import {
  Button,
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
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: MilitaryRegion | null;
  onSuccess: () => void;
}

function RegionFormModal({ isOpen, onOpenChange, editing, onSuccess }: FormModalProps) {
  const { createRegion, updateRegion, uploadLogo } = useRegion();
  const [regionCode, setRegionCode] = useState("");
  const [regionName, setRegionName] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRegionCode(editing?.regionCode ?? "");
      setRegionName(editing?.regionName ?? "");
      setEstablishedDate(editing?.establishedDate ?? "");
      setDescription(editing?.description ?? "");
      setLogoFile(null);
    }
  }, [isOpen, editing]);

  const handleSubmit = async (onClose: () => void) => {
    if (!regionCode.trim() || !regionName.trim()) return;
    try {
      setIsSubmitting(true);
      let logoUrl = editing?.logoUrl ?? undefined;

      if (logoFile) {
        const res = await uploadLogo(logoFile);
        logoUrl = (res as any)?.data?.path ?? (res as any)?.data ?? logoUrl;
      }

      const payload = {
        regionCode,
        regionName,
        logoUrl,
        establishedDate: establishedDate || undefined,
        description: description || undefined,
      };

      if (editing) {
        await updateRegion({ id: editing.id, ...payload });
      } else {
        await createRegion(payload);
      }
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
            <ModalHeader>{editing ? "Sửa quân khu" : "Thêm quân khu"}</ModalHeader>
            <ModalBody className="gap-3">
              <Input
                label="Mã quân khu"
                placeholder="VD: QK1"
                value={regionCode}
                onValueChange={setRegionCode}
                isRequired
                isDisabled={!!editing}
              />
              <Input
                label="Tên quân khu"
                placeholder="VD: Quân khu 1"
                value={regionName}
                onValueChange={setRegionName}
                isRequired
              />
              <Input
                label="Ngày thành lập"
                placeholder="VD: 1945-10-16"
                value={establishedDate}
                onValueChange={setEstablishedDate}
                description="Định dạng YYYY-MM-DD"
              />
              <Input
                label="Mô tả"
                placeholder="Mô tả về quân khu..."
                value={description}
                onValueChange={setDescription}
              />
              <div>
                <label className="text-sm text-gray-600 block mb-1">Logo (tùy chọn)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Hủy</Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                isDisabled={!regionCode.trim() || !regionName.trim()}
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
  target: MilitaryRegion | null;
  onSuccess: () => void;
}

function DeleteModal({ isOpen, onOpenChange, target, onSuccess }: DeleteModalProps) {
  const { deleteRegion } = useRegion();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    if (!target) return;
    try {
      setIsDeleting(true);
      await deleteRegion(target.id);
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
            <ModalHeader>Xóa quân khu</ModalHeader>
            <ModalBody>
              <p>Bạn có chắc muốn xóa quân khu <strong>{target?.regionName}</strong>?</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Hủy</Button>
              <Button color="danger" isLoading={isDeleting} onPress={() => handleDelete(onClose)}>
                Xóa
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function RegionsPage() {
  const { getRegions } = useRegion();
  const [regions, setRegions] = useState<MilitaryRegion[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<MilitaryRegion | null>(null);
  const [deleting, setDeleting] = useState<MilitaryRegion | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRegions({ keyword: debouncedKeyword || undefined, page: page - 1, size: PAGE_SIZE });
      const raw = (res as any)?.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      setRegions(list);
      setTotalPages(raw?.totalPages ?? 1);
    } catch {
      setRegions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getRegions, debouncedKeyword, page]);

  useEffect(() => { setPage(1); }, [debouncedKeyword]);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (r: MilitaryRegion) => { setEditing(r); formModal.onOpen(); };
  const openDelete = (r: MilitaryRegion) => { setDeleting(r); deleteModal.onOpen(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Quản lý Quân khu</h1>

      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm theo tên, mã..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button color="primary" onPress={openAdd}>+ Thêm quân khu</Button>
      </div>

      <Table
        aria-label="Danh sách quân khu"
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
          <TableColumn>MÃ</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>NGÀY THÀNH LẬP</TableColumn>
          <TableColumn>LOGO</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            : regions.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={6}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có quân khu nào"}
                  </TableCell>
                </TableRow>
              )
              : regions.map((r, i) => (
                  <TableRow key={String(r.id)}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{r.regionCode}</TableCell>
                    <TableCell>{r.regionName}</TableCell>
                    <TableCell>{r.establishedDate ?? "—"}</TableCell>
                    <TableCell>
                      {r.logoUrl
                        ? <img src={r.logoUrl} alt="logo" className="w-10 h-10 object-cover rounded" />
                        : <span className="text-gray-400 text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => openEdit(r)}>Sửa</Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => openDelete(r)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>

      <RegionFormModal
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
