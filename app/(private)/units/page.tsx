"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { MilitaryUnit, useUnit } from "@/hooks/use-unit";
import { useRegion } from "@/hooks/use-region";
import {
  Button,
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

interface RegionOption { regionCode: string; regionName: string; }

const PAGE_SIZE = 10;

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: MilitaryUnit | null;
  regions: RegionOption[];
  onSuccess: () => void;
}

function UnitFormModal({ isOpen, onOpenChange, editing, regions, onSuccess }: FormModalProps) {
  const { createUnit, updateUnit, uploadLogo } = useUnit();
  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [regionCode, setRegionCode] = useState<Set<string>>(new Set());
  const [address, setAddress] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUnitCode(editing?.unitCode ?? "");
      setUnitName(editing?.unitName ?? "");
      setRegionCode(editing?.regionCode ? new Set([editing.regionCode]) : new Set());
      setAddress(editing?.address ?? "");
      setEstablishedDate(editing?.establishedDate ?? "");
      setDescription(editing?.description ?? "");
      setLogoFile(null);
    }
  }, [isOpen, editing]);

  const selectedRegion = Array.from(regionCode)[0] ?? "";

  const handleSubmit = async (onClose: () => void) => {
    if (!unitCode.trim() || !unitName.trim() || !selectedRegion) return;
    try {
      setIsSubmitting(true);
      let logoUrl = editing?.logoUrl ?? undefined;

      if (logoFile) {
        const res = await uploadLogo(logoFile);
        logoUrl = (res as any)?.data?.path ?? (res as any)?.data ?? logoUrl;
      }

      const payload = {
        unitCode,
        unitName,
        regionCode: selectedRegion,
        logoUrl,
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
              <Select
                label="Quân khu"
                placeholder="Chọn quân khu"
                selectedKeys={regionCode}
                onSelectionChange={(keys) => setRegionCode(keys as Set<string>)}
                isRequired
              >
                {regions.map((r) => (
                  <SelectItem key={r.regionCode}>{r.regionName} ({r.regionCode})</SelectItem>
                ))}
              </Select>
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
                isDisabled={!unitCode.trim() || !unitName.trim() || !selectedRegion}
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
  const { getRegions } = useRegion();
  const [units, setUnits] = useState<MilitaryUnit[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [filterRegion, setFilterRegion] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<MilitaryUnit | null>(null);
  const [deleting, setDeleting] = useState<MilitaryUnit | null>(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const loadRegions = useCallback(async () => {
    const res = await getRegions().catch(() => null);
    const rawRegions = (res as any)?.data;
    const list = Array.isArray(rawRegions) ? rawRegions : rawRegions?.content ?? [];
    setRegions(list.map((r: any) => ({ regionCode: r.regionCode, regionName: r.regionName })));
  }, [getRegions]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedRegion = Array.from(filterRegion)[0];
      const res = await getUnits({
        regionCode: selectedRegion,
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
  }, [getUnits, filterRegion, debouncedKeyword, page]);

  useEffect(() => { loadRegions(); }, [loadRegions]);
  useEffect(() => { setPage(1); }, [debouncedKeyword, filterRegion]);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); formModal.onOpen(); };
  const openEdit = (u: MilitaryUnit) => { setEditing(u); formModal.onOpen(); };
  const openDelete = (u: MilitaryUnit) => { setDeleting(u); deleteModal.onOpen(); };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Quản lý Đơn vị</h1>

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
        <Button color="primary" onPress={openAdd}>+ Thêm đơn vị</Button>
      </div>

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
          <TableColumn>QUÂN KHU</TableColumn>
          <TableColumn>ĐỊA CHỈ</TableColumn>
          <TableColumn>LOGO</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            : units.length === 0
              ? (
                <TableRow>
                  <TableCell className="text-center text-gray-400 py-8" colSpan={7}>
                    {keyword ? "Không tìm thấy kết quả" : "Chưa có đơn vị nào"}
                  </TableCell>
                </TableRow>
              )
              : units.map((u, i) => (
                  <TableRow key={String(u.id)}>
                    <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{u.unitCode}</TableCell>
                    <TableCell>{u.unitName}</TableCell>
                    <TableCell>{u.regionCode}</TableCell>
                    <TableCell>{u.address ?? "—"}</TableCell>
                    <TableCell>
                      {u.logoUrl
                        ? <img src={u.logoUrl} alt="logo" className="w-10 h-10 object-cover rounded" />
                        : <span className="text-gray-400 text-sm">—</span>}
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

      <UnitFormModal
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        editing={editing}
        regions={regions}
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
