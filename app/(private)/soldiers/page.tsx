"use client";

import { PageHeader } from "@/components/PageHeader";
import { SoldierTable } from "@/components/SoldierTable";
import { Suspense } from "react";

export default function SoldierPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader
        icon="mdi:shield-account-outline"
        title="Danh sách quân nhân"
        subtitle="Quản lý hồ sơ và tài khoản quân nhân"
      />

      <Suspense fallback={null}>
        <SoldierTable />
      </Suspense>
    </div>
  );
}
