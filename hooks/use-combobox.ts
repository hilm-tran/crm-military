import { apiClient } from "@/lib/api-client";
import { useCallback, useMemo } from "react";

export interface ComboboxItem {
  code: string;
  name: string;
}

export interface Rank extends ComboboxItem {}
export interface Position extends ComboboxItem {}
export interface Region extends ComboboxItem {}
export interface Unit extends ComboboxItem {}

export const useCombobox = () => {
  const getRanks = useCallback(async (): Promise<Rank[]> => {
    try {
      const result = await apiClient.get<Rank[]>("/api/common/combobox/ranks");
      return result.data || [];
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
      return result.data || [];
    } catch (error: any) {
      console.error("Get Positions Error:", error);
      return [];
    }
  }, []);

  const getRegions = useCallback(async (): Promise<Region[]> => {
    try {
      const result = await apiClient.get<Region[]>(
        "/api/common/combobox/regions",
      );
      return result.data || [];
    } catch (error: any) {
      console.error("Get Regions Error:", error);
      return [];
    }
  }, []);

  const getUnits = useCallback(async (regionCode?: string): Promise<Unit[]> => {
    try {
      const query = regionCode
        ? `?regionCode=${encodeURIComponent(regionCode)}`
        : "";
      const result = await apiClient.get<Unit[]>(
        `/api/common/combobox/units${query}`,
      );
      return result.data || [];
    } catch (error: any) {
      console.error("Get Units Error:", error);
      return [];
    }
  }, []);

  return useMemo(
    () => ({
      getRanks,
      getPositions,
      getRegions,
      getUnits,
    }),
    [getRanks, getPositions, getRegions, getUnits],
  );
};
