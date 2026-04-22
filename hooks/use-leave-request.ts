import { apiClient } from "@/lib/api-client";
import { addToast } from "@heroui/toast";
import { useCallback, useMemo } from "react";

export interface LeaveRequestHistory {
  id: string;
  round: string;
  status: "TRINH" | "CHUA_XU_LY" | "DA_DUYET" | "TU_CHOI" | "TRA_VE";
  assignee: string;
  order: number;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: string;
  militaryPersonnelId: string;
  userId: string;
  leaveFrom: string;
  leaveTo: string;
  status: string;
  flowId: string;
  currentOrderNo: number;
  currentRound: string;
  currentAssignee: string;
  allowedOutCount: number;
  usedOutCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeaveRequestParams {
  leaveFrom: string;
  leaveTo: string;
  allowedOutCount: number;
  reason?: string;
}

export interface ApproveLeaveRequestParams {
  reason?: string;
}

export interface ReturnLeaveRequestParams {
  reason: string;
}

export interface SupplementLeaveRequestParams {
  leaveFrom: string;
  leaveTo: string;
  allowedOutCount: number;
  reason?: string;
}

export const useLeaveRequest = () => {
  const createLeaveRequest = useCallback(
    async (data: CreateLeaveRequestParams) => {
      try {
        const result = await apiClient.post<LeaveRequest>(
          "/api/leave-requests",
          data,
        );

        addToast({
          title: "Thành công",
          description: "Đã tạo đơn nghỉ phép",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Create Leave Request Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể tạo đơn nghỉ phép",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const getMyLeaveRequests = useCallback(async () => {
    try {
      return await apiClient.get<LeaveRequest[]>("/api/leave-requests/my");
    } catch (error: any) {
      console.error("Get My Leave Requests Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn của tôi",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getPendingLeaveRequests = useCallback(async () => {
    try {
      return await apiClient.get<LeaveRequest[]>("/api/leave-requests/pending");
    } catch (error: any) {
      console.error("Get Pending Leave Requests Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách chờ duyệt",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getLeaveRequestById = useCallback(async (id: string) => {
    try {
      return await apiClient.get<LeaveRequest>(`/api/leave-requests/${id}`);
    } catch (error: any) {
      console.error("Get Leave Request Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin đơn",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const getLeaveRequestHistories = useCallback(async (id: string) => {
    try {
      return await apiClient.get<LeaveRequestHistory[]>(
        `/api/leave-requests/${id}/histories`,
      );
    } catch (error: any) {
      console.error("Get Leave Request Histories Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tải lịch sử duyệt",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const acceptLeaveRequest = useCallback(async (id: string) => {
    try {
      const result = await apiClient.post(
        `/api/leave-requests/${id}/accept`,
        {},
      );

      addToast({
        title: "Thành công",
        description: "Đã tiếp nhận đơn",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Accept Leave Request Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể tiếp nhận đơn",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const approveLeaveRequest = useCallback(
    async (id: string, data?: ApproveLeaveRequestParams) => {
      try {
        const result = await apiClient.post(
          `/api/leave-requests/${id}/approve`,
          data || {},
        );

        addToast({
          title: "Thành công",
          description: "Đã duyệt đơn",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Approve Leave Request Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể duyệt đơn",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const returnLeaveRequest = useCallback(
    async (id: string, data: ReturnLeaveRequestParams) => {
      try {
        const result = await apiClient.post(
          `/api/leave-requests/${id}/return`,
          data,
        );

        addToast({
          title: "Thành công",
          description: "Đã trả về đơn",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Return Leave Request Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể trả về đơn",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const editLeaveRequest = useCallback(
    async (id: string, data: CreateLeaveRequestParams) => {
      try {
        const result = await apiClient.fetch<LeaveRequest>(
          `/api/leave-requests/${id}/edit`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          },
        );

        addToast({
          title: "Thành công",
          description: "Đã sửa đơn",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Edit Leave Request Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể sửa đơn",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const resubmitLeaveRequest = useCallback(async (id: string) => {
    try {
      const result = await apiClient.post(
        `/api/leave-requests/${id}/resubmit`,
        {},
      );

      addToast({
        title: "Thành công",
        description: "Đã trình lại đơn",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Resubmit Leave Request Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể trình lại đơn",
        color: "danger",
      });
      throw error;
    }
  }, []);

  const supplementLeaveRequest = useCallback(
    async (id: string, data: SupplementLeaveRequestParams) => {
      try {
        const result = await apiClient.post(
          `/api/leave-requests/${id}/supplement`,
          data,
        );

        addToast({
          title: "Thành công",
          description: "Đã bổ sung đơn",
          color: "success",
        });

        return result;
      } catch (error: any) {
        console.error("Supplement Leave Request Error:", error);
        addToast({
          title: "Lỗi",
          description: error.message || "Không thể bổ sung đơn",
          color: "danger",
        });
        throw error;
      }
    },
    [],
  );

  const submitNextLeaveRequest = useCallback(async (id: string) => {
    try {
      const result = await apiClient.post(
        `/api/leave-requests/${id}/submit-next`,
        {},
      );

      addToast({
        title: "Thành công",
        description: "Đã trình cấp cao hơn",
        color: "success",
      });

      return result;
    } catch (error: any) {
      console.error("Submit Next Leave Request Error:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể trình cấp cao hơn",
        color: "danger",
      });
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      createLeaveRequest,
      getMyLeaveRequests,
      getPendingLeaveRequests,
      getLeaveRequestById,
      getLeaveRequestHistories,
      acceptLeaveRequest,
      approveLeaveRequest,
      returnLeaveRequest,
      editLeaveRequest,
      resubmitLeaveRequest,
      supplementLeaveRequest,
      submitNextLeaveRequest,
    }),
    [
      createLeaveRequest,
      getMyLeaveRequests,
      getPendingLeaveRequests,
      getLeaveRequestById,
      getLeaveRequestHistories,
      acceptLeaveRequest,
      approveLeaveRequest,
      returnLeaveRequest,
      editLeaveRequest,
      resubmitLeaveRequest,
      supplementLeaveRequest,
      submitNextLeaveRequest,
    ],
  );
};
