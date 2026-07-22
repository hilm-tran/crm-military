import { apiClient } from "@/lib/api-client";
import { useCallback, useMemo } from "react";

export interface ComboboxItem {
  code: string;
  name: string;
}

export interface Rank extends ComboboxItem {}
export interface Position extends ComboboxItem {}
export interface Unit extends ComboboxItem {}
export interface UserOption extends ComboboxItem {}

export const useCombobox = () => {
  const getRanks = useCallback(async (): Promise<Rank[]> => {
    try {
      const result = await apiClient.get<Rank[]>("/api/common/combobox/ranks");
      return (result as any)?.data ?? [];
    } catch (error: any) {
      console.error("Get Ranks Error:", error);
      return [];
    }
  }, []);

  const getPositions = useCallback(async (): Promise<Position[]> => {
    try {
      const result = await apiClient.get<Position[]>(
        "/api/common/combobox/positions",
      );
      return (result as any)?.data ?? [];
    } catch (error: any) {
      console.error("Get Positions Error:", error);
      return [];
    }
  }, []);

  const getUnits = useCallback(async (): Promise<Unit[]> => {
    try {
      const result = await apiClient.get<Unit[]>("/api/common/combobox/units");
      return (result as any)?.data ?? [];
    } catch (error: any) {
      console.error("Get Units Error:", error);
      return [];
    }
  }, []);

  const getUsers = useCallback(async (): Promise<UserOption[]> => {
    try {
      const result = await apiClient.get<UserOption[]>(
        "/api/common/combobox/users",
      );
      return (result as any)?.data ?? [];
    } catch (error: any) {
      console.error("Get Users Error:", error);
      return [];
    }
  }, []);

  return useMemo(
    () => ({
      getRanks,
      getPositions,
      getUnits,
      getUsers,
    }),
    [getRanks, getPositions, getUnits, getUsers],
  );
};
