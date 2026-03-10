"use client";

import { Button, Checkbox, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export default function RequestPage() {
  return (
    <div className="p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-4">

        <h1 className="text-xl font-semibold">
          Danh sách yêu cầu
        </h1>

        <div className="flex gap-2">
          <Button color="success">
            Duyệt
          </Button>

          <Button color="danger">
            Từ chối
          </Button>
        </div>

      </div>

      {/* Table */}

      <Table aria-label="Request Table">

        <TableHeader>

          <TableColumn>
            <Checkbox />
          </TableColumn>
          <TableColumn>STT</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>ĐƠN VỊ</TableColumn>
          <TableColumn>THỜI GIAN</TableColumn>
          <TableColumn>SỐ LẦN</TableColumn>
          <TableColumn>NGƯỜI TẠO</TableColumn>

        </TableHeader>

        <TableBody>

          <TableRow>

            <TableCell>
              <Checkbox />
            </TableCell>

            <TableCell>1</TableCell>
            <TableCell>Nguyễn Văn A</TableCell>
            <TableCell>Tiểu đoàn 1</TableCell>
            <TableCell>3 ngày</TableCell>
            <TableCell>2</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>

        </TableBody>

      </Table>

    </div>
  );
}