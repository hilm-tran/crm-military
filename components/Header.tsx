"use client";

import { Avatar, Input } from "@heroui/react";

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-white border-b">

      <Input
        placeholder="Tìm kiếm..."
        className="w-80"
      />

      <Avatar name="Admin" />
    </div>
  );
}