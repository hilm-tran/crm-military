import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface MilitaryPersonnelQR {
  id: string;
  fullName: string;
  rankCode: string;
  unitCode: string;
  positionCode: string;
  qrCode: string;
}

export interface CitizenQR {
  name: string;
  birthday: string;
  address: string;
  citizenId: string;
  issueDate: string;
}

export type QRScanData = MilitaryPersonnelQR | CitizenQR;

export interface QRScanLog {
  id: string;
  type: "MILITARY_PERSONNEL" | "CITIZEN";
  status: "DANG_XU_LY" | "DONG_Y" | "TU_CHOI";
  payload: Record<string, any>;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanQRParams {
  data: QRScanData;
}

export const useQRScan = () => {
  const scanQR = useCallback(async (data: ScanQRParams) => {
    try {
      const result = await apiClient.post<QRScanLog>(
        "/api/qr-scan-logs/scan",
        data,
      );

      addToast({
        title: "Thành công",
        description: "Đã quét QR thành công",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Scan QR Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể quét QR",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const approveQRScan = useCallback(async (id: string) => {
    try {
      const result = await apiClient.post(
        `/api/qr-scan-logs/${id}/approve`,
        {},
      );

      addToast({
        title: "Thành công",
        description: "Đã duyệt quét QR",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Approve QR Scan Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể duyệt quét QR",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const rejectQRScan = useCallback(async (id: string, reason?: string) => {
    try {
      const result = await apiClient.post(`/api/qr-scan-logs/${id}/reject`, {
        reason,
      });

      addToast({
        title: "Thành công",
        description: "Đã từ chối quét QR",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Reject QR Scan Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể từ chối quét QR",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getQRScanLog = useCallback(async (id: string) => {
    try {
      return await apiClient.get<QRScanLog>(`/api/qr-scan-logs/${id}`);
    } catch (error: any) {
      console.error("Get QR Scan Log Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin quét QR",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getQRScanLogs = useCallback(
    async (params?: { page?: number; size?: number }) => {
      try {
        const { page = 0, size = 20 } = params ?? {};
        const query = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        }).toString();
        return await apiClient.get<QRScanLog[]>(`/api/qr-scan-logs?${query}`);
      } catch (error: any) {
        console.error("Get QR Scan Logs Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể tải lịch sử quét QR",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      scanQR,
      approveQRScan,
      rejectQRScan,
      getQRScanLog,
      getQRScanLogs,
    }),
    [scanQR, approveQRScan, rejectQRScan, getQRScanLog, getQRScanLogs],
  );
};
