"use client";

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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

import { AddSoldierModal } from "./AddSoldierModal";
import { EditSoldierModal } from "./EditSoldierModal";
import { SoldierVehicleModal } from "./SoldierVehicleModal";

import { useCombobox } from "@/hooks/use-combobox";
import { useDebounce } from "@/hooks/use-debounce";
import { Soldier, useSoldier } from "@/hooks/use-soldier";
import { CookieNames } from "@/types/global.enum";

// Roles allowed to create/edit/delete personnel (BE enforces; FE hides the UI).
const MANAGE_ROLES = [
  "ROLE_SYSTEM_ADMIN",
  "ROLE_ADMIN_REGION",
  "ROLE_ADMIN_UNIT",
];

const QRCodeCell = ({
  base64,
  name,
  onClick,
}: {
  base64: string;
  name: string;
  onClick: () => void;
}) => {
  if (!base64) return <span className="text-default-400 text-sm">—</span>;

  return (
    <button
      className="w-16 h-16 border rounded bg-white p-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
      title={`Phóng to QR - ${name}`}
      type="button"
      onClick={onClick}
    >
      <img
        alt="QR Code"
        className="w-full h-full object-contain"
        src={`data:image/png;base64,${base64}`}
      />
    </button>
  );
};

export const SoldierTable = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getRanks, getPositions } = useCombobox();
  const {
    isOpen: isQROpen,
    onOpen: onQROpen,
    onOpenChange: onQROpenChange,
  } = useDisclosure();
  const [qrSoldier, setQrSoldier] = useState<Soldier | null>(null);
  const {
    isOpen: isVehicleModalOpen,
    onOpen: onVehicleModalOpen,
    onOpenChange: onVehicleModalOpenChange,
  } = useDisclosure();
  const [selectedVehicleSoldier, setSelectedVehicleSoldier] =
    useState<Soldier | null>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [editSoldier, setEditSoldier] = useState<Soldier | null>(null);
  const [rankMap, setRankMap] = useState<Record<string, string>>({});
  const [positionMap, setPositionMap] = useState<Record<string, string>>({});

  // Read roles from the session cookie on the client (avoids SSR hydration mismatch).
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    try {
      const raw = Cookies.get(CookieNames.Session);
      const roles: string[] = raw ? (JSON.parse(raw).roles ?? []) : [];

      setCanManage(roles.some((r) => MANAGE_ROLES.includes(r)));
    } catch {
      setCanManage(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([getRanks(), getPositions()]).then(([ranks, positions]) => {
      setRankMap(Object.fromEntries(ranks.map((r) => [r.code, r.name])));
      setPositionMap(
        Object.fromEntries(positions.map((p) => [p.code, p.name])),
      );
    });
  }, [getRanks, getPositions]);
  // Keyword state for the input
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);

  // Sync debounced keyword to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentKeyword = searchParams.get("keyword") || "";

    if (debouncedKeyword === currentKeyword) return;

    if (debouncedKeyword) {
      params.set("keyword", debouncedKeyword);
    } else {
      params.delete("keyword");
    }
    // Reset to page 1 on search
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [debouncedKeyword, router, searchParams]);

  const { getSoldiers, deleteSoldier } = useSoldier();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [data, setData] = useState<Soldier[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;

  const fetchSoldiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSoldiers({
        page: page - 1, // API uses 0-based index
        size,
        keyword,
      });

      setData(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Fetch soldiers error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getSoldiers, page, size, keyword]);

  useEffect(() => {
    fetchSoldiers();
  }, [page, size, keyword]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDeleteClick = (soldier: Soldier) => {
    setSelectedSoldier(soldier);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSoldier) return;

    try {
      setIsDeleting(true);
      await deleteSoldier(selectedSoldier.id);
      onDeleteOpenChange();
      setSelectedSoldier(null);
      fetchSoldiers();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <Input
          isClearable
          className="w-full sm:max-w-xs"
          placeholder="Tìm kiếm theo tên, số hiệu..."
          startContent={
            <Icon className="text-default-400" icon="mdi:magnify" />
          }
          value={keyword}
          onClear={() => setKeyword("")}
          onValueChange={setKeyword}
        />

        {canManage && (
          <Button
            className="w-full sm:w-auto"
            color="primary"
            startContent={<Icon icon="mdi:plus" />}
            onPress={onOpen}
          >
            Thêm
          </Button>
        )}
      </div>

      <div className="hidden sm:flex flex-col gap-4">
        <Table
          aria-label="Danh sách quân nhân"
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
                  onChange={handlePageChange}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>STT</TableColumn>
            <TableColumn>HỌ TÊN</TableColumn>
            <TableColumn>MÃ SỐ</TableColumn>
            <TableColumn>ĐƠN VỊ</TableColumn>
            <TableColumn>CẤP BẬC</TableColumn>
            <TableColumn>CHỨC VỤ</TableColumn>
            <TableColumn align="center">QR CODE</TableColumn>
            <TableColumn align="center">HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={!isLoading && "Không tìm thấy quân nhân nào"}
            isLoading={isLoading}
            items={data}
            loadingContent={<Spinner />}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {data.indexOf(item) + 1 + (page - 1) * size}
                </TableCell>
                <TableCell>{item.fullName}</TableCell>
                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                <TableCell>{item.unitCode ?? "—"}</TableCell>
                <TableCell>
                  {item.rankCode
                    ? (rankMap[item.rankCode] ?? item.rankCode)
                    : "—"}
                </TableCell>
                <TableCell>
                  {item.positionCode
                    ? (positionMap[item.positionCode] ?? item.positionCode)
                    : "—"}
                </TableCell>
                <TableCell>
                  <QRCodeCell
                    base64={item.qrCode}
                    name={item.fullName}
                    onClick={() => {
                      setQrSoldier(item);
                      onQROpen();
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {canManage && (
                      <Button
                        isIconOnly
                        aria-label="Sửa"
                        size="sm"
                        title="Sửa"
                        variant="flat"
                        onPress={() => {
                          setEditSoldier(item);
                          onEditOpen();
                        }}
                      >
                        <Icon icon="mdi:pencil-outline" />
                      </Button>
                    )}
                    <Button
                      isIconOnly
                      aria-label="Phương tiện"
                      color={item.vehicle ? "primary" : "default"}
                      size="sm"
                      title="Phương tiện"
                      variant="flat"
                      onPress={() => {
                        setSelectedVehicleSoldier(item);
                        onVehicleModalOpen();
                      }}
                    >
                      <Icon icon="mdi:car-outline" />
                    </Button>
                    {canManage && (
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => handleDeleteClick(item)}
                      >
                        <Icon icon="mdi:trash" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-default-400 py-8">
            Không tìm thấy quân nhân nào
          </p>
        ) : (
          data.map((item, idx) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.fullName}</p>
                  <p className="text-xs text-default-400 font-mono">
                    {item.code}
                  </p>
                </div>
                <QRCodeCell
                  base64={item.qrCode}
                  name={item.fullName}
                  onClick={() => {
                    setQrSoldier(item);
                    onQROpen();
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-default-500">
                <p>
                  STT:{" "}
                  <span className="text-foreground">
                    {idx + 1 + (page - 1) * size}
                  </span>
                </p>
                <p>
                  Đơn vị:{" "}
                  <span className="text-foreground">
                    {item.unitCode ?? "—"}
                  </span>
                </p>
                <p>
                  Cấp bậc:{" "}
                  <span className="text-foreground">
                    {item.rankCode
                      ? (rankMap[item.rankCode] ?? item.rankCode)
                      : "—"}
                  </span>
                </p>
                <p>
                  Chức vụ:{" "}
                  <span className="text-foreground">
                    {item.positionCode
                      ? (positionMap[item.positionCode] ?? item.positionCode)
                      : "—"}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                {canManage && (
                  <Button
                    className="flex-1"
                    size="sm"
                    startContent={<Icon icon="mdi:pencil-outline" />}
                    variant="flat"
                    onPress={() => {
                      setEditSoldier(item);
                      onEditOpen();
                    }}
                  >
                    Sửa
                  </Button>
                )}
                <Button
                  className="flex-1"
                  color={item.vehicle ? "primary" : "default"}
                  size="sm"
                  startContent={<Icon icon="mdi:car-outline" />}
                  variant="flat"
                  onPress={() => {
                    setSelectedVehicleSoldier(item);
                    onVehicleModalOpen();
                  }}
                >
                  Phương tiện
                </Button>
                {canManage && (
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => handleDeleteClick(item)}
                  >
                    <Icon icon="mdi:trash" />
                  </Button>
                )}
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
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <AddSoldierModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={() => {
          fetchSoldiers();
        }}
      />

      <SoldierVehicleModal
        isOpen={isVehicleModalOpen}
        soldier={selectedVehicleSoldier}
        onOpenChange={onVehicleModalOpenChange}
        onSuccess={fetchSoldiers}
      />

      <EditSoldierModal
        isOpen={isEditOpen}
        soldier={editSoldier}
        onOpenChange={onEditOpenChange}
        onSuccess={fetchSoldiers}
      />

      {/* QR Zoom Modal */}
      <Modal isOpen={isQROpen} size="md" onOpenChange={onQROpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{qrSoldier?.fullName}</ModalHeader>
              <ModalBody className="flex flex-col items-center pb-6 gap-3">
                {qrSoldier?.qrCode && (
                  <img
                    alt="QR Code"
                    className="w-64 h-64 border rounded-lg bg-white"
                    src={`data:image/png;base64,${qrSoldier.qrCode}`}
                  />
                )}
                <p className="text-xs text-default-400 font-mono text-center">
                  {qrSoldier?.code}
                </p>
                <a
                  className="text-sm text-primary-600 hover:underline"
                  download={`qr-${qrSoldier?.code}.png`}
                  href={`data:image/png;base64,${qrSoldier?.qrCode}`}
                >
                  Tải xuống QR
                </a>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Xóa quân nhân
              </ModalHeader>
              <ModalBody>
                <p>
                  Bạn có chắc chắn muốn xóa{" "}
                  <strong>{selectedSoldier?.fullName}</strong>?
                </p>
                <p className="text-sm text-default-500">
                  Hành động này không thể hoàn tác.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="danger"
                  isLoading={isDeleting}
                  onPress={handleDeleteConfirm}
                >
                  Xóa
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
