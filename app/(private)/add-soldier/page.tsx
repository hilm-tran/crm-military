'use client';

import { Button, Input } from "@heroui/react";

export default function AddSoldier() {
  return (
    <div className="p-6 max-w-xl w-full">

      <h1 className="text-xl font-semibold mb-4">
        Thêm quân nhân
      </h1>

      <div className="space-y-4">

        <Input label="Họ tên" />

        <Input label="Cấp bậc" />

        <Input label="Đơn vị" />

        <Input label="Chức vụ" />

        <Button color="primary">
          Thêm
        </Button>

      </div>

    </div>
  );
}