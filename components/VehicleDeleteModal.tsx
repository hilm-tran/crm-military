"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React from "react";

interface VehicleDeleteModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  licensePlate?: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export const VehicleDeleteModal: React.FC<VehicleDeleteModalProps> = ({
  isOpen,
  onOpenChange,
  licensePlate,
  isDeleting,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Xóa phương tiện</ModalHeader>
            <ModalBody>
              <p>
                Bạn có chắc chắn muốn xóa phương tiện{" "}
                <strong>{licensePlate ?? ""}</strong>?
              </p>
              <p className="text-sm text-default-500">
                Hành động này không thể hoàn tác.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Hủy
              </Button>
              <Button color="danger" isLoading={isDeleting} onPress={onConfirm}>
                Xóa
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
