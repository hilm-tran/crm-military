"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { ImageUpload } from "./ImageUpload";

import { useCombobox } from "@/hooks/use-combobox";
import { Soldier, useSoldier } from "@/hooks/use-soldier";
import { filenameFromImageUrl, resolveImageUrl } from "@/lib/image-url";

interface EditSoldierModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  soldier: Soldier | null;
  onSuccess?: () => void;
}

type Option = { code: string; name: string };

export const EditSoldierModal: React.FC<EditSoldierModalProps> = ({
  isOpen,
  onOpenChange,
  soldier,
  onSuccess,
}) => {
  const { updateSoldier } = useSoldier();
  const { getRanks, getPositions, getUnits } = useCombobox();

  const [ranks, setRanks] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);

  const [fullName, setFullName] = useState("");
  const [rankCode, setRankCode] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [positionCode, setPositionCode] = useState("");
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getRanks().then(setRanks);
    getPositions().then(setPositions);
    getUnits().then(setUnits);
  }, [isOpen, getRanks, getPositions, getUnits]);

  useEffect(() => {
    if (isOpen && soldier) {
      setFullName(soldier.fullName ?? "");
      setRankCode(soldier.rankCode ?? "");
      setUnitCode(soldier.unitCode ?? "");
      setPositionCode(soldier.positionCode ?? "");
      // Preserve existing image by resending its filename unless a new one is picked.
      setImagePath(
        soldier.imageUrl ? filenameFromImageUrl(soldier.imageUrl) : undefined,
      );
    }
  }, [isOpen, soldier]);

  const isValid =
    fullName.trim() && rankCode && unitCode && positionCode && soldier;

  const handleSubmit = async (onClose: () => void) => {
    if (!isValid || !soldier) return;
    try {
      setIsSubmitting(true);
      await updateSoldier(soldier.id, {
        fullName: fullName.trim(),
        rankCode,
        unitCode,
        positionCode,
        imagePath,
      });
      onClose();
      onSuccess?.();
    } catch {
      // toast handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="top-center"
      scrollBehavior="inside"
      size="xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Sửa quân nhân</ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Input
                    isRequired
                    label="Họ tên"
                    value={fullName}
                    variant="bordered"
                    onValueChange={setFullName}
                  />
                  <Select
                    isRequired
                    label="Cấp bậc"
                    selectedKeys={rankCode ? new Set([rankCode]) : new Set()}
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setRankCode((Array.from(keys)[0] as string) ?? "")
                    }
                  >
                    {ranks.map((r) => (
                      <SelectItem key={r.code}>{r.name}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    isRequired
                    label="Đơn vị"
                    placeholder="Chọn đơn vị"
                    selectedKeys={unitCode ? new Set([unitCode]) : new Set()}
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setUnitCode((Array.from(keys)[0] as string) ?? "")
                    }
                  >
                    {units.map((u) => (
                      <SelectItem key={u.code}>{u.name}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    isRequired
                    label="Chức vụ"
                    selectedKeys={
                      positionCode ? new Set([positionCode]) : new Set()
                    }
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setPositionCode((Array.from(keys)[0] as string) ?? "")
                    }
                  >
                    {positions.map((p) => (
                      <SelectItem key={p.code}>{p.name}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-xs text-default-500 uppercase">
                    Ảnh đại diện
                  </p>
                  <ImageUpload
                    defaultValue={
                      resolveImageUrl(soldier?.imageUrl) ?? undefined
                    }
                    onUploadSuccess={(path) => setImagePath(path)}
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
                isDisabled={!isValid}
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onClose)}
              >
                Lưu
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
