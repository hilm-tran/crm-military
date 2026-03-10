import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "@heroui/react";

export default function QRModal({open}: {open: boolean}) {
  return (
    <Modal isOpen={open}>
      <ModalHeader>Kết quả QR</ModalHeader>

      <ModalBody>

        <p>Họ tên: Nguyễn Văn A</p>
        <p>Đơn vị: Tiểu đoàn 1</p>
        <p>Cấp bậc: Đại úy</p>
        <p>Chức vụ: Trung đội trưởng</p>

      </ModalBody>

      <ModalFooter>
        <Button color="success">
          Được phép vào
        </Button>
      </ModalFooter>

    </Modal>
  );
}