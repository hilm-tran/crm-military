'use client';

import { Card } from "@heroui/react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold">
        Dashboard
      </h1>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-4">

        <Card className="p-6">
          <p className="text-sm text-gray-500">
            Tổng quân nhân
          </p>

          <h2 className="text-2xl font-bold">
            125
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-500">
            Trong doanh trại
          </p>

          <h2 className="text-2xl font-bold text-green-600">
            83
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-500">
            Đã ra
          </p>

          <h2 className="text-2xl font-bold text-gray-600">
            42
          </h2>
        </Card>

      </div>

    </div>
  );
}