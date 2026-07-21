"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

import { VehicleDeleteModal } from "./VehicleDeleteModal";
import { VehicleFieldsValue, VehicleFormFields } from "./VehicleFormFields";
import { VehicleImagesUpload } from "./VehicleImagesUpload";

import { filenameFromImageUrl } from "@/lib/image-url";
import { useVehicle } from "@/hooks/use-vehicle";
import { Soldier } from "@/hooks/use-soldier";

interface SoldierVehicleModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  soldier: Soldier | null;
  onSuccess: () => void;
}

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

export const SoldierVehicleModal: React.FC<SoldierVehicleModalProps> = ({
  isOpen,
  onOpenChange,
  soldier,
  onSuccess,
}) => {
  const { attachVehicle, updateVehicle, deleteVehicle } = useVehicle();
  const [vehicle, setVehicle] = useState<VehicleFieldsValue>(EMPTY_VEHICLE);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof VehicleFieldsValue, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteModal = useDisclosure();

  const existingVehicle = soldier?.vehicle ?? null;

  useEffect(() => {
    if (!isOpen) return;
    if (existingVehicle) {
      setVehicle({
        vehicleType: existingVehicle.vehicleType,
        brand: existingVehicle.brand,
        model: existingVehicle.model,
        licensePlate: existingVehicle.licensePlate,
      });
      const paths = existingVehicle.imageUrls.map(filenameFromImageUrl);

      setImagePaths(paths);
      setImageUrls(existingVehicle.imageUrls);
    } else {
      setVehicle(EMPTY_VEHICLE);
      setImagePaths([]);
      setImageUrls([]);
    }
    setErrors({});
  }, [isOpen, soldier?.id]);

  const handleSave = async (onClose: () => void) => {
    const nextErrors: Partial<Record<keyof VehicleFieldsValue, string>> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!vehicle[field]) nextErrors[field] = "Bắt buộc";
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      return;
    }

    if (!soldier) return;
    const payload = {
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      imagePaths: imagePaths.length ? imagePaths : undefined,
    };

    setIsSaving(true);
    try {
      if (existingVehicle) {
        await updateVehicle(existingVehicle.id, payload);
      } else {
        await attachVehicle(soldier.id, payload);
      }
      onClose();
      onSuccess();
    } catch {
      // Error handled by hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingVehicle) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(existingVehicle.id);
      deleteModal.onOpenChange();
      onOpenChange();
      onSuccess();
    } catch {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
                Phương tiện của {soldier?.fullName}
                {soldier?.code ? ` (${soldier.code})` : ""}
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="grid grid-cols-2 gap-4">
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
                      vehicleId={existingVehicle?.id}
                      onChange={setImagePaths}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="justify-between">
                {existingVehicle ? (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={deleteModal.onOpen}
                  >
                    Xóa phương tiện
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button variant="light" onPress={onClose}>
                    Hủy
                  </Button>
                  <Button
                    color="primary"
                    isLoading={isSaving}
                    onPress={() => handleSave(onClose)}
                  >
                    Lưu
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <VehicleDeleteModal
        isDeleting={isDeleting}
        isOpen={deleteModal.isOpen}
        licensePlate={existingVehicle?.licensePlate}
        onConfirm={handleDelete}
        onOpenChange={deleteModal.onOpenChange}
      />
    </>
  );
};
