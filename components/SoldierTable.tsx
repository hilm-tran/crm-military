"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useCombobox } from "@/hooks/use-combobox";
import { Soldier, useSoldier } from "@/hooks/use-soldier";
import {
  Button,
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
import { AddSoldierModal } from "./AddSoldierModal";

const QRCodeCell = ({ base64, name, onClick }: { base64: string; name: string; onClick: () => void }) => {
  if (!base64) return <span className="text-gray-400 text-sm">—</span>;
  return (
    <img
      alt="QR Code"
      className="w-16 h-16 border rounded bg-white cursor-pointer hover:opacity-80 transition-opacity"
      src={`data:image/png;base64,${base64}`}
      onClick={onClick}
      title={`Phóng to QR - ${name}`}
    />
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
  const { isOpen: isQROpen, onOpen: onQROpen, onOpenChange: onQROpenChange } = useDisclosure();
  const [qrSoldier, setQrSoldier] = useState<Soldier | null>(null);
  const [rankMap, setRankMap] = useState<Record<string, string>>({});
  const [positionMap, setPositionMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getRanks(), getPositions()]).then(([ranks, positions]) => {
      setRankMap(Object.fromEntries(ranks.map((r) => [r.code, r.name])));
      setPositionMap(Object.fromEntries(positions.map((p) => [p.code, p.name])));
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
      <div className="flex gap-4 items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder="Tìm kiếm theo tên, số hiệu..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={
            <Icon icon="mdi:magnify" className="text-default-400" />
          }
          isClearable
          onClear={() => setKeyword("")}
        />

        <Button
          color="primary"
          onPress={onOpen}
          startContent={<Icon icon="mdi:plus" />}
        >
          Thêm
        </Button>
      </div>

      <div className="flex flex-col gap-4">
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
            items={data}
            loadingContent={<Spinner />}
            isLoading={isLoading}
            emptyContent={!isLoading && "Không tìm thấy quân nhân nào"}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {data.indexOf(item) + 1 + (page - 1) * size}
                </TableCell>
                <TableCell>{item.fullName}</TableCell>
                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                <TableCell>{item.unitCode ?? "—"}</TableCell>
                <TableCell>{item.rankCode ? (rankMap[item.rankCode] ?? item.rankCode) : "—"}</TableCell>
                <TableCell>{item.positionCode ? (positionMap[item.positionCode] ?? item.positionCode) : "—"}</TableCell>
                <TableCell>
                  <QRCodeCell
                    base64={item.qrCode}
                    name={item.fullName}
                    onClick={() => { setQrSoldier(item); onQROpen(); }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleDeleteClick(item)}
                    >
                      <Icon icon="mdi:trash" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddSoldierModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={() => {
          fetchSoldiers();
        }}
      />

      {/* QR Zoom Modal */}
      <Modal isOpen={isQROpen} onOpenChange={onQROpenChange} size="md">
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
                <p className="text-xs text-gray-400 font-mono text-center">{qrSoldier?.code}</p>
                <a
                  href={`data:image/png;base64,${qrSoldier?.qrCode}`}
                  download={`qr-${qrSoldier?.code}.png`}
                  className="text-sm text-blue-500 hover:underline"
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
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteConfirm}
                  isLoading={isDeleting}
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
