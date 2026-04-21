import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface MilitaryRegion {
  id: string | number;
  regionCode: string;
  regionName: string;
  logoUrl?: string | null;
  establishedDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRegionParams {
  regionCode: string;
  regionName: string;
  logoUrl?: string;
  establishedDate?: string;
  description?: string;
}

export interface UpdateRegionParams extends CreateRegionParams {
  id: string | number;
}

export const useRegion = () => {
  const createRegion = useCallback(async (data: CreateRegionParams) => {
    try {
      const result = await apiClient.post<MilitaryRegion>(
        "/api/military-regions",
        data,
      );

      addToast({
        title: "Thành công",
        description: "Đã thêm quân khu mới",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Create Region Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể thêm quân khu",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const updateRegion = useCallback(async (data: UpdateRegionParams) => {
    try {
      const { id, ...body } = data;
      const result = await apiClient.fetch<MilitaryRegion>(
        `/api/military-regions/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật quân khu",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Update Region Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật quân khu",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteRegion = useCallback(async (id: string) => {
    try {
      await apiClient.fetch(`/api/military-regions/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa quân khu",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Region Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa quân khu",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getRegions = useCallback(async (params?: { keyword?: string; page?: number; size?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params?.keyword) query.set("keyword", params.keyword);
      if (params?.page !== undefined) query.set("page", params.page.toString());
      if (params?.size !== undefined) query.set("size", params.size.toString());
      const qs = query.toString();
      return await apiClient.get<MilitaryRegion[]>(`/api/military-regions${qs ? `?${qs}` : ""}`);
    } catch (error: any) {
      console.error("Get Regions Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách quân khu",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getRegionById = useCallback(async (id: string) => {
    try {
      return await apiClient.get<MilitaryRegion>(`/api/military-regions/${id}`);
    } catch (error: any) {
      console.error("Get Region Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin quân khu",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("multipartFile", file);

      const result = await apiClient.fetch("/api/common/upload-image", {
        method: "POST",
        body: formData,
        headers: {},
      });

      addToast({
        title: "Thành công",
        description: "Đã tải logo lên",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Upload Logo Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải logo lên",
        color: "danger",
      });
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      createRegion,
      updateRegion,
      deleteRegion,
      getRegions,
      getRegionById,
      uploadLogo,
    }),
    [
      createRegion,
      updateRegion,
      deleteRegion,
      getRegions,
      getRegionById,
      uploadLogo,
    ],
  );
};
