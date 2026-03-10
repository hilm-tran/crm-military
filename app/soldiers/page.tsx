'use client';

import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export default function SoldierPage() {
  return (
    <div className="p-6">

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Danh sách quân nhân
        </h1>

        <Button color="primary">
          Thêm
        </Button>
      </div>

	  <Table aria-label="History Table">

        <TableHeader>
          <TableColumn>STT</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>ĐƠN VỊ</TableColumn>
          <TableColumn>CẤP BẬC</TableColumn>
          <TableColumn>CHỨC VỤ</TableColumn>
        </TableHeader>

        <TableBody>

          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Nguyễn Văn A</TableCell>
            <TableCell>Tiểu đoàn 1</TableCell>
            <TableCell>Thiếu tá</TableCell>
            <TableCell>Đội trưởng</TableCell>
          </TableRow>

        </TableBody>

      </Table>

    </div>
  );
}