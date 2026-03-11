"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };
  return (
    <div className="w-64 h-screen flex flex-col bg-blue-900 text-white p-5">
      <h1 className="text-xl font-bold mb-8">Military Gate</h1>

      <nav className="flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Link href="/soldiers">Quân nhân</Link>
          <Link href="/history">Lịch sử ra vào</Link>
          <Link href="/requests">Duyệt yêu cầu</Link>
          <Link href="/add-soldier">Thêm quân nhân</Link>
        </div>

        <Button color="danger" onPress={handleSignOut}>
          Đăng xuất
        </Button>
      </nav>
    </div>
  );
}
