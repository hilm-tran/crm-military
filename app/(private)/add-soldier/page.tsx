"use client";

import { AddSoldierModal } from "@/components/AddSoldierModal";
import { Button, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function AddSoldier() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to soldiers list after successful creation
    router.push("/soldiers");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Thêm quân nhân</h1>
        <p className="text-gray-600">
          Tạo hồ sơ và tài khoản cho quân nhân mới
        </p>
      </div>

      <Button color="primary" onPress={onOpen} size="lg">
        Mở form thêm quân nhân
      </Button>

      <AddSoldierModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
