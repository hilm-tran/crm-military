import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api";

export const VEHICLE_TYPE_OPTIONS = [
  { code: "CAR", name: "Ô tô" },
  { code: "MOTORBIKE", name: "Xe máy" },
  { code: "OTHER", name: "Khác" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPE_OPTIONS)[number]["code"];

export interface VehicleResponse {
  id: number;
  personnelId: number;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  licensePlate: string;
  imageUrls: string[];
}

export interface VehicleRequestPayload {
  vehicleType: VehicleType | "";
  brand: string;
  model: string;
  licensePlate: string;
  imagePaths?: string[];
}

export const useVehicle = () => {
  const attachVehicle = useCallback(
    async (personnelId: number, data: VehicleRequestPayload) => {
      try {
        const result = await apiClient.post<VehicleResponse>(
          `/api/vehicles?personnelId=${personnelId}`,
          data,
        );

        addToast({
          title: "Thành công",
          description: "Đã gán phương tiện cho quân nhân",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Attach Vehicle Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể gán phương tiện",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const updateVehicle = useCallback(
    async (id: number, data: VehicleRequestPayload) => {
      try {
        const result = await apiClient.fetch<VehicleResponse>(
          `/api/vehicles/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          },
        );

        addToast({
          title: "Thành công",
          description: "Đã cập nhật phương tiện",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Update Vehicle Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật phương tiện",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const getVehicles = useCallback(
    async (params: { page?: number; size?: number; keyword?: string }) => {
      try {
        const { page = 0, size = 10, keyword = "" } = params;
        const query = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          keyword,
        }).toString();

        return await apiClient.get<PaginatedResponse<VehicleResponse>>(
          `/api/vehicles?${query}`,
        );
      } catch (error: any) {
        console.error("Get Vehicles Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách phương tiện",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const getVehicleById = useCallback(async (id: number) => {
    try {
      return await apiClient.get<VehicleResponse>(`/api/vehicles/${id}`);
    } catch (error: any) {
      console.error("Get Vehicle Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin phương tiện",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getVehicleByPersonnelId = useCallback(async (personnelId: number) => {
    try {
      return await apiClient.get<VehicleResponse>(
        `/api/vehicles/by-personnel/${personnelId}`,
      );
    } catch (error: any) {
      console.error("Get Vehicle By Personnel Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin phương tiện",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteVehicle = useCallback(async (id: number) => {
    try {
      await apiClient.fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa phương tiện",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Vehicle Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa phương tiện",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteVehicleImage = useCallback(
    async (id: number, imagePath: string) => {
      try {
        await apiClient.fetch(
          `/api/vehicles/${id}/images?imagePath=${encodeURIComponent(imagePath)}`,
          { method: "DELETE" },
        );
      } catch (error: any) {
        console.error("Delete Vehicle Image Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể xóa ảnh phương tiện",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const uploadVehicleImage = useCallback(async (file: File) => {
    try {
      const formData = new FormData();

      formData.append("multipartFile", file);

      const result = await apiClient.fetch(
        "/api/common/upload-image?category=vehicle",
        {
          method: "POST",
          body: formData,
        },
      );

      return result;
    } catch (error: any) {
      console.error("Upload Vehicle Image Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải ảnh lên",
        color: "danger",
      });
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      attachVehicle,
      updateVehicle,
      getVehicles,
      getVehicleById,
      getVehicleByPersonnelId,
      deleteVehicle,
      deleteVehicleImage,
      uploadVehicleImage,
    }),
    [
      attachVehicle,
      updateVehicle,
      getVehicles,
      getVehicleById,
      getVehicleByPersonnelId,
      deleteVehicle,
      deleteVehicleImage,
      uploadVehicleImage,
    ],
  );
};
