import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface LeaveApprovalConfig {
  id: string;
  militaryPosition: string;
  militaryPositionName?: string;
  maxApprovalDays: number;
  effectiveFrom: string;
  effectiveTo: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeaveApprovalConfigParams {
  militaryPosition: string;
  maxApprovalDays: number;
  effectiveFrom: string;
  effectiveTo: string;
  active?: boolean;
}

export interface UpdateLeaveApprovalConfigParams
  extends CreateLeaveApprovalConfigParams {
  id: string;
}

export const useLeaveApprovalConfig = () => {
  const createConfig = useCallback(
    async (data: CreateLeaveApprovalConfigParams) => {
      try {
        const result = await apiClient.post<LeaveApprovalConfig>(
          "/api/leave-approval-configs",
          data,
        );

        addToast({
          title: "Thành công",
          description: "Đã tạo cấu hình phê duyệt",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Create Leave Approval Config Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể tạo cấu hình phê duyệt",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const updateConfig = useCallback(
    async (data: UpdateLeaveApprovalConfigParams) => {
      try {
        const { id, ...body } = data;
        const result = await apiClient.fetch<LeaveApprovalConfig>(
          `/api/leave-approval-configs/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          },
        );

        addToast({
          title: "Thành công",
          description: "Đã cập nhật cấu hình phê duyệt",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Update Leave Approval Config Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật cấu hình phê duyệt",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const deleteConfig = useCallback(async (id: string) => {
    try {
      await apiClient.fetch(`/api/leave-approval-configs/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa cấu hình phê duyệt",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Leave Approval Config Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa cấu hình phê duyệt",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getConfigs = useCallback(async () => {
    try {
      return await apiClient.get<LeaveApprovalConfig[]>(
        "/api/leave-approval-configs",
      );
    } catch (error: any) {
      console.error("Get Leave Approval Configs Error:", error);
      addToast({
        title: "Lỗi",
        description:
          error.message || "Không thể tải danh sách cấu hình phê duyệt",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getConfigById = useCallback(async (id: string) => {
    try {
      return await apiClient.get<LeaveApprovalConfig>(
        `/api/leave-approval-configs/${id}`,
      );
    } catch (error: any) {
      console.error("Get Leave Approval Config Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải cấu hình phê duyệt",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const toggleConfigActive = useCallback(async (id: string) => {
    try {
      const result = await apiClient.fetch<LeaveApprovalConfig>(
        `/api/leave-approval-configs/${id}/active`,
        {
          method: "PATCH",
          body: JSON.stringify({}),
        },
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái cấu hình",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Toggle Config Active Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái cấu hình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getApplicableConfigs = useCallback(async () => {
    try {
      return await apiClient.get<LeaveApprovalConfig[]>(
        "/api/leave-approval-configs/applicable",
      );
    } catch (error: any) {
      console.error("Get Applicable Configs Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải cấu hình áp dụng",
        color: "danger",
      });
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      createConfig,
      updateConfig,
      deleteConfig,
      getConfigs,
      getConfigById,
      toggleConfigActive,
      getApplicableConfigs,
    }),
    [
      createConfig,
      updateConfig,
      deleteConfig,
      getConfigs,
      getConfigById,
      toggleConfigActive,
      getApplicableConfigs,
    ],
  );
};
