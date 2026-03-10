'use client';

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export default function HistoryPage() {
  return (
    <div className="p-6">

      <h1 className="text-xl font-semibold mb-4">
        Lịch sử ra vào
      </h1>

      <Table aria-label="History Table">

        <TableHeader>
          <TableColumn>STT</TableColumn>
          <TableColumn>TÊN</TableColumn>
          <TableColumn>ĐƠN VỊ</TableColumn>
          <TableColumn>GIỜ VÀO</TableColumn>
          <TableColumn>GIỜ RA</TableColumn>
        </TableHeader>

        <TableBody>

          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Nguyễn Văn A</TableCell>
            <TableCell>Tiểu đoàn 1</TableCell>
            <TableCell>08:00</TableCell>
            <TableCell>17:00</TableCell>
          </TableRow>

        </TableBody>

      </Table>

    </div>
  );
}