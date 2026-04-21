import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface MilitaryUnit {
  id: string | number;
  unitCode: string;
  unitName: string;
  regionCode: string;
  logoUrl?: string | null;
  address?: string;
  establishedDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUnitParams {
  unitCode: string;
  unitName: string;
  regionCode: string;
  logoUrl?: string;
  address?: string;
  establishedDate?: string;
  description?: string;
}

export interface UpdateUnitParams extends CreateUnitParams {
  id: string | number;
}

export const useUnit = () => {
  const createUnit = useCallback(async (data: CreateUnitParams) => {
    try {
      const result = await apiClient.post<MilitaryUnit>(
        "/api/military-units",
        data,
      );

      addToast({
        title: "Thành công",
        description: "Đã thêm đơn vị mới",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Create Unit Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể thêm đơn vị",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const updateUnit = useCallback(async (data: UpdateUnitParams) => {
    try {
      const { id, ...body } = data;
      const result = await apiClient.fetch<MilitaryUnit>(
        `/api/military-units/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật đơn vị",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Update Unit Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đơn vị",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteUnit = useCallback(async (id: string) => {
    try {
      await apiClient.fetch(`/api/military-units/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa đơn vị",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Unit Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa đơn vị",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getUnits = useCallback(async (params?: { regionCode?: string; keyword?: string; page?: number; size?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params?.regionCode) query.set("regionCode", params.regionCode);
      if (params?.keyword) query.set("keyword", params.keyword);
      if (params?.page !== undefined) query.set("page", params.page.toString());
      if (params?.size !== undefined) query.set("size", params.size.toString());
      const qs = query.toString();
      return await apiClient.get<MilitaryUnit[]>(`/api/military-units${qs ? `?${qs}` : ""}`);
    } catch (error: any) {
      console.error("Get Units Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn vị",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getUnitById = useCallback(async (id: string) => {
    try {
      return await apiClient.get<MilitaryUnit>(`/api/military-units/${id}`);
    } catch (error: any) {
      console.error("Get Unit Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin đơn vị",
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
      createUnit,
      updateUnit,
      deleteUnit,
      getUnits,
      getUnitById,
      uploadLogo,
    }),
    [createUnit, updateUnit, deleteUnit, getUnits, getUnitById, uploadLogo],
  );
};
