"use client";

import { PageHeader } from "@/components/PageHeader";
import { SoldierTable } from "@/components/SoldierTable";

export default function SoldierPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader
        icon="mdi:shield-account-outline"
        title="Danh sách quân nhân"
        subtitle="Quản lý hồ sơ và tài khoản quân nhân"
      />

      <SoldierTable />
    </div>
  );
}
