import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

// SubmissionGroup Types
export interface SubmissionGroup {
  id: string;
  name: string;
  description?: string;
  userIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubmissionGroupParams {
  name: string;
  description?: string;
}

export interface UpdateSubmissionGroupParams
  extends CreateSubmissionGroupParams {
  id: string;
}

// SubmissionFlow Types
export interface SubmissionFlowGroup {
  orderNo: number;
  groupId: string | number;
}

export interface SubmissionFlow {
  id: string;
  code: string;
  name: string;
  description?: string;
  groups: SubmissionFlowGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubmissionFlowParams {
  code: string;
  name: string;
  description?: string;
  groups: SubmissionFlowGroup[];
}

export interface UpdateSubmissionFlowParams extends CreateSubmissionFlowParams {
  id: string;
}

export const useSubmission = () => {
  // SubmissionGroup Operations
  const createGroup = useCallback(async (data: CreateSubmissionGroupParams) => {
    try {
      const result = await apiClient.post<SubmissionGroup>(
        "/api/submission-groups",
        data,
      );

      addToast({
        title: "Thành công",
        description: "Đã tạo nhóm trình mới",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Create Submission Group Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nhóm trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const updateGroup = useCallback(async (data: UpdateSubmissionGroupParams) => {
    try {
      const { id, ...body } = data;
      const result = await apiClient.fetch<SubmissionGroup>(
        `/api/submission-groups/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật nhóm trình",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Update Submission Group Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật nhóm trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    try {
      await apiClient.fetch(`/api/submission-groups/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa nhóm trình",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Submission Group Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa nhóm trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getGroups = useCallback(async () => {
    try {
      return await apiClient.get<SubmissionGroup[]>("/api/submission-groups");
    } catch (error: any) {
      console.error("Get Submission Groups Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách nhóm trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const addUserToGroup = useCallback(
    async (groupId: string, userId: string) => {
      try {
        const result = await apiClient.post(
          `/api/submission-groups/${groupId}/users`,
          { userId },
        );

        addToast({
          title: "Thành công",
          description: "Đã thêm người dùng vào nhóm",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Add User to Group Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể thêm người dùng vào nhóm",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const removeUserFromGroup = useCallback(
    async (groupId: string, userId: string) => {
      try {
        await apiClient.fetch(
          `/api/submission-groups/${groupId}/users`,
          {
            method: "DELETE",
            body: JSON.stringify({ userId }),
          },
        );

        addToast({
          title: "Thành công",
          description: "Đã xóa người dùng khỏi nhóm",
          color: "success",
        });
      } catch (error: any) {
        console.error("Remove User from Group Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể xóa người dùng khỏi nhóm",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  // SubmissionFlow Operations
  const createFlow = useCallback(async (data: CreateSubmissionFlowParams) => {
    try {
      const result = await apiClient.post<SubmissionFlow>(
        "/api/submission-flows",
        data,
      );

      addToast({
        title: "Thành công",
        description: "Đã tạo luồng trình mới",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Create Submission Flow Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tạo luồng trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const updateFlow = useCallback(async (data: UpdateSubmissionFlowParams) => {
    try {
      const { id, ...body } = data;
      const result = await apiClient.fetch<SubmissionFlow>(
        `/api/submission-flows/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      addToast({
        title: "Thành công",
        description: "Đã cập nhật luồng trình",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Update Submission Flow Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật luồng trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const deleteFlow = useCallback(async (id: string) => {
    try {
      await apiClient.fetch(`/api/submission-flows/${id}`, {
        method: "DELETE",
      });

      addToast({
        title: "Thành công",
        description: "Đã xóa luồng trình",
        color: "success",
      });
    } catch (error: any) {
      console.error("Delete Submission Flow Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể xóa luồng trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getFlows = useCallback(async () => {
    try {
      return await apiClient.get<SubmissionFlow[]>("/api/submission-flows");
    } catch (error: any) {
      console.error("Get Submission Flows Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách luồng trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getFlowById = useCallback(async (id: string) => {
    try {
      return await apiClient.get<SubmissionFlow>(`/api/submission-flows/${id}`);
    } catch (error: any) {
      console.error("Get Submission Flow Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin luồng trình",
        color: "danger",
      });
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      createGroup,
      updateGroup,
      deleteGroup,
      getGroups,
      addUserToGroup,
      removeUserFromGroup,
      createFlow,
      updateFlow,
      deleteFlow,
      getFlows,
      getFlowById,
    }),
    [
      createGroup,
      updateGroup,
      deleteGroup,
      getGroups,
      addUserToGroup,
      removeUserFromGroup,
      createFlow,
      updateFlow,
      deleteFlow,
      getFlows,
      getFlowById,
    ],
  );
};
