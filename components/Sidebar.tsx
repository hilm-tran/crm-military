"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-5">
      <h1 className="text-xl font-bold mb-8">Military Gate</h1>

      <nav className="flex flex-col gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/history">Lịch sử ra vào</Link>
        <Link href="/soldiers">Quân nhân</Link>
        <Link href="/add-soldier">Thêm quân nhân</Link>
        <Link href="/requests">Duyệt yêu cầu</Link>
      </nav>
    </div>
  );
}