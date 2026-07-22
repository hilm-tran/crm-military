"use client";

import { AddSoldierModal } from "@/components/AddSoldierModal";
import { PageHeader } from "@/components/PageHeader";
import { Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function AddSoldier() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to soldiers list after successful creation
    router.push("/soldiers");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        icon="mdi:account-plus-outline"
        title="Thêm quân nhân"
        subtitle="Tạo hồ sơ và tài khoản cho quân nhân mới"
      />

      <Button color="primary" onPress={onOpen} size="lg" startContent={<Icon icon="mdi:plus" />}>
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
