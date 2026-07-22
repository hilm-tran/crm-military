"use client";

import { PageHeader } from "@/components/PageHeader";
import { useDebounce } from "@/hooks/use-debounce";
import { MilitaryUnit, useUnit } from "@/hooks/use-unit";
import {
  Button,
  Card,
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

const PAGE_SIZE = 10;

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: MilitaryUnit | null;
  onSuccess: () => void;
}

function UnitFormModal({ isOpen, onOpenChange, editing, onSuccess }: FormModalProps) {
  const { createUnit, updateUnit, uploadLogo } = useUnit();
  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [address, setAddress] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUnitCode(editing?.unitCode ?? "");
      setUnitName(editing?.unitName ?? "");
      setAddress(editing?.address ?? "");
      setEstablishedDate(editing?.establishedDate ?? "");
      setDescription(editing?.description ?? "");
      setLogoFile(null);
    }
  }, [isOpen, editing]);

  const handleSubmit = async (onClose: () => void) => {
    if (!unitCode.trim() || !unitName.trim()) return;
    try {
      setIsSubmitting(true);
      let logoPath = editing?.logoUrl ?? undefined;

      if (logoFile) {
        const res = await uploadLogo(logoFile);
        logoPath = (res as any)?.data?.path ?? (res as any)?.data ?? logoPath;
      }

      const payload = {
        unitCode,
        unitName,
        logoPath,
        address: address || undefined,
        establishedDate: establishedDate || undefined,
        description: description || undefined,
      };

      if (editing) {
        await updateUnit({ id: editing.id, ...payload });
      } else {
        await createUnit(payload);
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
            <ModalHeader>{editing ? "Sửa đơn vị" : "Thêm đơn vị"}</ModalHeader>
            <ModalBody className="gap-3">
              <Input
                label="Mã đơn vị"
                placeholder="VD: DV001"
                value={unitCode}
                onValueChange={setUnitCode}
                isRequired
                isDisabled={!!editing}
              />
              <Input
                label="Tên đơn vị"
                placeholder="VD: Tiểu đoàn 1"
                value={unitName}
                onValueChange={setUnitName}
                isRequired
              />
              <Input
                label="Địa chỉ"
                placeholder="VD: Số 1 Đường ABC, TP.HCM"
                value={address}
                onValueChange={setAddress}
              />
              <Input
                label="Ngày thành lập"
                placeholder="VD: 1975-04-30"
                value={establishedDate}
                onValueChange={setEstablishedDate}
                description="Định dạng YYYY-MM-DD"
              />
              <Input
                label="Mô tả"
                placeholder="Mô tả về đơn vị..."
                value={description}
                onValueChange={setDescription}
              />
              <div>
                <label htmlFor="unit-logo-file" className="text-sm text-default-600 block mb-1">
                  Logo (tùy chọn)
                </label>
                <input
                  id="unit-logo-file"
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
                isDisabled={!unitCode.trim() || !unitName.trim()}
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
  target: MilitaryUnit | null;
  onSuccess: () => void;
}

function DeleteModal({ isOpen, onOpenChange, target, onSuccess }: DeleteModalProps) {
  const { deleteUnit } = useUnit();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    if (!target) return;
    try {
      setIsDeleting(true);
      await deleteUnit(String(target.id));
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
            <ModalHeader>Xóa đơn vị</ModalHeader>
            <ModalBody>
              <p>Bạn có chắc muốn xóa đơn vị <strong>{target?.unitName}</strong>?</p>
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

export default function UnitsPage() {
  const { getUnits } = useUnit();
  const [units, setUnits] = useState<MilitaryUnit[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<MilitaryUnit | null>(null);
  const [deleting, setDeleting] = useState<MilitaryUnit | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUnits({
        keyword: debouncedKeyword || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      const raw = (res as any)?.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      setUnits(list);
      setTotalPages(raw?.totalPages ?? 1);
    } catch {
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, [getUnits, debouncedKeyword, page]);

  useEffect(() => { setPage(1); }, [debouncedKeyword]);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (u: MilitaryUnit) => { setEditing(u); formModal.onOpen(); };
  const openDelete = (u: MilitaryUnit) => { setDeleting(u); deleteModal.onOpen(); };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        icon="mdi:office-building-marker-outline"
        title="Quản lý Đơn vị"
        subtitle="Danh sách đơn vị"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Tìm kiếm theo tên, mã..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
          isClearable
          onClear={() => setKeyword("")}
        />
        <Button className="w-full sm:w-auto" color="primary" onPress={openAdd} startContent={<Icon icon="mdi:plus" />}>
          Thêm đơn vị
        </Button>
      </div>

      <div className="hidden sm:block">
      <Table
        aria-label="Danh sách đơn vị"
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
          <TableColumn>ĐỊA CHỈ</TableColumn>
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
            : units.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-default-400 py-8" colSpan={6}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có đơn vị nào"}
                  </TableCell>
                </TableRow>
              )
              : units.map((u, i) => (
                  <TableRow key={String(u.id)}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{u.unitCode}</TableCell>
                    <TableCell>{u.unitName}</TableCell>
                    <TableCell>{u.address ?? "—"}</TableCell>
                    <TableCell>
                      {u.logoUrl
                        ? <img src={u.logoUrl} alt="logo" className="w-10 h-10 object-cover rounded" />
                        : <span className="text-default-400 text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => openEdit(u)}>Sửa</Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => openDelete(u)}>Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-full rounded" />
            </Card>
          ))
        ) : units.length === 0 ? (
          <p className="text-center text-default-400 py-8">
            {keyword ? "Không tìm thấy kết quả" : "Chưa có đơn vị nào"}
          </p>
        ) : (
          units.map((u) => (
            <Card key={String(u.id)} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.unitName}</p>
                  <p className="text-xs text-default-400 font-mono">{u.unitCode}</p>
                </div>
                {u.logoUrl ? (
                  <img src={u.logoUrl} alt="logo" className="w-10 h-10 shrink-0 object-cover rounded" />
                ) : null}
              </div>
              {u.address && (
                <p className="mt-2 text-xs text-default-500">{u.address}</p>
              )}
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" size="sm" variant="flat" onPress={() => openEdit(u)}>Sửa</Button>
                <Button className="flex-1" size="sm" variant="flat" color="danger" onPress={() => openDelete(u)}>Xóa</Button>
              </div>
            </Card>
          ))
        )}
        {totalPages > 1 && (
          <div className="flex w-full justify-center pt-2">
            <Pagination isCompact showControls showShadow color="primary" page={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <UnitFormModal
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
