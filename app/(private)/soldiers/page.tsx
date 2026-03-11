"use client";

import { SoldierTable } from "@/components/SoldierTable";

export default function SoldierPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Danh sách quân nhân</h1>
      </div>

      <SoldierTable />
    </div>
  );
}
