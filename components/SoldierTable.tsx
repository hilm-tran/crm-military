"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { Soldier, useSoldier } from "@/hooks/use-soldier";
import {
  Button,
  Input,
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
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { AddSoldierModal } from "./AddSoldierModal";

const QRCodeCell = ({ text }: { text: string }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, { width: 100, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [text]);

  if (!qrCodeUrl) return <Spinner size="sm" />;

  return (
    <img
      alt="QR Code"
      className="w-16 h-16 border rounded bg-white"
      src={qrCodeUrl}
    />
  );
};

export const SoldierTable = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Keyword state for the input
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const debouncedKeyword = useDebounce(keyword, 500);

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

  const { getSoldiers } = useSoldier();

  const [isLoading, setIsLoading] = useState(true);
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
            <TableColumn>SỐ HIỆU</TableColumn>
            <TableColumn>ĐƠN VỊ</TableColumn>
            <TableColumn>CẤP BẬC</TableColumn>
            <TableColumn>CHỨC VỤ</TableColumn>
            <TableColumn align="center">QR CODE</TableColumn>
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
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.unitName}</TableCell>
                <TableCell>{item.rank}</TableCell>
                <TableCell>{item.position}</TableCell>
                <TableCell>
                  <QRCodeCell text={item.qrCode} />
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
    </>
  );
};
