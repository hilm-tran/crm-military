"use client";

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
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

import { PageHeader } from "@/components/PageHeader";
import { VehicleDeleteModal } from "@/components/VehicleDeleteModal";
import {
  VehicleFieldsValue,
  VehicleFormFields,
} from "@/components/VehicleFormFields";
import { VehicleImagesUpload } from "@/components/VehicleImagesUpload";
import { useCombobox, UserOption } from "@/hooks/use-combobox";
import { useDebounce } from "@/hooks/use-debounce";
import {
  VEHICLE_TYPE_OPTIONS,
  useVehicle,
  VehicleResponse,
} from "@/hooks/use-vehicle";
import { filenameFromImageUrl, resolveImageUrl } from "@/lib/image-url";

const PAGE_SIZE = 10;

const EMPTY_VEHICLE: VehicleFieldsValue = {
  vehicleType: "",
  brand: "",
  model: "",
  licensePlate: "",
};

const REQUIRED_FIELDS = [
  "vehicleType",
  "brand",
  "model",
  "licensePlate",
] as const;

const vehicleTypeLabel = (code: string) =>
  VEHICLE_TYPE_OPTIONS.find((option) => option.code === code)?.name ?? code;

// ─── Form modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  editing: VehicleResponse | null;
  onSuccess: () => void;
}

function VehicleFormModal({
  isOpen,
  onOpenChange,
  editing,
  onSuccess,
}: FormModalProps) {
  const { attachVehicle, updateVehicle } = useVehicle();
  const { getUsers } = useCombobox();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [personnelId, setPersonnelId] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleFieldsValue>(EMPTY_VEHICLE);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof VehicleFieldsValue, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getUsers().then(setUsers);
    if (editing) {
      setPersonnelId(String(editing.personnelId));
      setVehicle({
        vehicleType: editing.vehicleType,
        brand: editing.brand,
        model: editing.model,
        licensePlate: editing.licensePlate,
      });
      setImagePaths(editing.imageUrls.map(filenameFromImageUrl));
      setImageUrls(editing.imageUrls);
    } else {
      setPersonnelId(null);
      setVehicle(EMPTY_VEHICLE);
      setImagePaths([]);
      setImageUrls([]);
    }
    setErrors({});
  }, [isOpen, editing, getUsers]);

  const handleSubmit = async (onClose: () => void) => {
    const nextErrors: Partial<Record<keyof VehicleFieldsValue, string>> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!vehicle[field]) nextErrors[field] = "Bắt buộc";
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      return;
    }
    if (!editing && !personnelId) return;

    const payload = {
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      imagePaths: imagePaths.length ? imagePaths : undefined,
    };

    try {
      setIsSubmitting(true);
      if (editing) {
        await updateVehicle(editing.id, payload);
      } else {
        await attachVehicle(Number(personnelId), payload);
      }
      onClose();
      onSuccess();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {editing ? "Sửa phương tiện" : "Thêm phương tiện"}
            </ModalHeader>
            <ModalBody className="gap-4">
              <Autocomplete
                isRequired
                description={
                  editing
                    ? undefined
                    : "Chọn quân nhân sẽ được gán phương tiện này"
                }
                isDisabled={!!editing}
                label="Quân nhân"
                placeholder="Tìm và chọn quân nhân..."
                selectedKey={personnelId}
                onSelectionChange={(key) =>
                  setPersonnelId(key ? String(key) : null)
                }
              >
                {users.map((u) => (
                  <AutocompleteItem key={String(u.code)}>
                    {u.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VehicleFormFields
                  errors={errors}
                  value={vehicle}
                  onChange={setVehicle}
                />
                <div className="space-y-2">
                  <p className="font-medium text-xs text-default-500 uppercase">
                    Ảnh phương tiện
                  </p>
                  <VehicleImagesUpload
                    imagePaths={imagePaths}
                    imageUrls={imageUrls}
                    vehicleId={editing?.id}
                    onChange={setImagePaths}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button
                color="primary"
                isDisabled={!editing && !personnelId}
                isLoading={isSubmitting}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const { getVehicles, deleteVehicle } = useVehicle();
  const { getUsers } = useCombobox();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<VehicleResponse | null>(null);
  const [deleting, setDeleting] = useState<VehicleResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getVehicles({
        keyword: debouncedKeyword || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      const raw = (res as any)?.data;

      setVehicles(raw?.content ?? []);
      setTotalPages(raw?.totalPages ?? 1);
    } catch {
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, [getVehicles, debouncedKeyword, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    getUsers().then(setUsers);
  }, [getUsers]);

  const personnelName = (personnelId: number) =>
    users.find((u) => String(u.code) === String(personnelId))?.name ??
    String(personnelId);

  const openAdd = () => {
    setEditing(null);
    formModal.onOpen();
  };
  const openEdit = (v: VehicleResponse) => {
    setEditing(v);
    formModal.onOpen();
  };
  const openDelete = (v: VehicleResponse) => {
    setDeleting(v);
    deleteModal.onOpen();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(deleting.id);
      deleteModal.onOpenChange();
      setDeleting(null);
      load();
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        icon="mdi:car-outline"
        subtitle="Danh sách phương tiện của quân nhân"
        title="Quản lý Phương tiện"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <Input
          isClearable
          className="w-full sm:max-w-xs"
          placeholder="Tìm kiếm theo biển số, hãng, hiệu xe..."
          startContent={
            <Icon className="text-default-400" icon="mdi:magnify" />
          }
          value={keyword}
          onClear={() => setKeyword("")}
          onValueChange={setKeyword}
        />
        <Button
          className="w-full sm:w-auto"
          color="primary"
          startContent={<Icon icon="mdi:plus" />}
          onPress={openAdd}
        >
          Thêm phương tiện
        </Button>
      </div>

      <div className="hidden sm:block">
      <Table
        aria-label="Danh sách phương tiện"
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
          <TableColumn>QUÂN NHÂN</TableColumn>
          <TableColumn>LOẠI XE</TableColumn>
          <TableColumn>HÃNG</TableColumn>
          <TableColumn>HIỆU</TableColumn>
          <TableColumn>BIỂN SỐ</TableColumn>
          <TableColumn>ẢNH</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : vehicles.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-center text-default-400 py-8"
                colSpan={8}
              >
                {keyword ? "Không tìm thấy kết quả" : "Chưa có phương tiện nào"}
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v, i) => (
              <TableRow key={v.id}>
                <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell>{personnelName(v.personnelId)}</TableCell>
                <TableCell>{vehicleTypeLabel(v.vehicleType)}</TableCell>
                <TableCell>{v.brand}</TableCell>
                <TableCell>{v.model}</TableCell>
                <TableCell className="font-mono font-medium">
                  {v.licensePlate}
                </TableCell>
                <TableCell>
                  {v.imageUrls?.[0] ? (
                    <img
                      alt="Ảnh phương tiện"
                      className="w-10 h-10 object-cover rounded"
                      src={resolveImageUrl(v.imageUrls[0]) ?? undefined}
                    />
                  ) : (
                    <span className="text-default-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => openEdit(v)}
                    >
                      Sửa
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => openDelete(v)}
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
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
        ) : vehicles.length === 0 ? (
          <p className="text-center text-default-400 py-8">
            {keyword ? "Không tìm thấy kết quả" : "Chưa có phương tiện nào"}
          </p>
        ) : (
          vehicles.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {personnelName(v.personnelId)}
                  </p>
                  <p className="text-xs text-default-400 font-mono">
                    {v.licensePlate}
                  </p>
                </div>
                {v.imageUrls?.[0] ? (
                  <img
                    alt="Ảnh phương tiện"
                    className="w-12 h-12 shrink-0 object-cover rounded"
                    src={resolveImageUrl(v.imageUrls[0]) ?? undefined}
                  />
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-default-500">
                <p>
                  Loại xe:{" "}
                  <span className="text-foreground">
                    {vehicleTypeLabel(v.vehicleType)}
                  </span>
                </p>
                <p>
                  Hãng/Hiệu:{" "}
                  <span className="text-foreground">
                    {v.brand} {v.model}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  variant="flat"
                  onPress={() => openEdit(v)}
                >
                  Sửa
                </Button>
                <Button
                  className="flex-1"
                  color="danger"
                  size="sm"
                  variant="flat"
                  onPress={() => openDelete(v)}
                >
                  Xóa
                </Button>
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

      <VehicleFormModal
        editing={editing}
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        onSuccess={load}
      />
      <VehicleDeleteModal
        isDeleting={isDeleting}
        isOpen={deleteModal.isOpen}
        licensePlate={deleting?.licensePlate}
        onConfirm={handleDelete}
        onOpenChange={deleteModal.onOpenChange}
      />
    </div>
  );
}
