'use client';

import { Button, Card, Input } from "@heroui/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">

      <Card className="w-[400px] p-8 space-y-4">

        <h1 className="text-xl font-bold text-center">
          Hệ thống kiểm soát ra vào
        </h1>

        <Input label="Tên đăng nhập" />

        <Input
          label="Mật khẩu"
          type="password"
        />

        <Button color="primary">
          Đăng nhập
        </Button>

      </Card>

    </div>
  );
}