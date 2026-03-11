import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface Soldier {
  id: number;
  fullName: string;
  rank: string;
  unitName: string;
  position: string;
  code: string;
  qrCode: string;
  imageUrl: string;
}

export interface PaginatedResponse<T> {
  data: {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    content: T[];
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

export interface CreateSoldierParams {
  username: string;
  email: string;
  password?: string;
  role: string[];
  militaryPersonnel: {
    fullName: string;
    rankCode: string;
    unitCode: string;
    positionCode: string;
    imagePath?: string;
  };
}

export const useSoldier = () => {
  const createSoldier = useCallback(async (data: CreateSoldierParams) => {
    try {
      const result = await apiClient.post("/api/auth/signup", data);

      addToast({
        title: "Thành công",
        description: "Đã thêm quân nhân mới",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Create Soldier Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể thêm quân nhân",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("multipartFile", file);

      const result = await apiClient.fetch("/api/personnel/upload-image", {
        method: "POST",
        body: formData,
      });

      addToast({
        title: "Thành công",
        description: "Đã tải ảnh lên",
        color: "success",
      });

      return result; // Assuming this returns { data: "image-path.jpg" } or similar
    } catch (error: any) {
      console.error("Upload Image Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải ảnh lên",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getSoldiers = useCallback(
    async (params: { page?: number; size?: number; keyword?: string }) => {
      try {
        const { page = 0, size = 10, keyword = "" } = params;
        const query = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          keyword,
        }).toString();

        return await apiClient.get<PaginatedResponse<Soldier>>(
          `/api/personnel?${query}`,
        );
      } catch (error: any) {
        console.error("Get Soldiers Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách quân nhân",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      createSoldier,
      uploadImage,
      getSoldiers,
    }),
    [createSoldier, uploadImage, getSoldiers],
  );
};
