"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import React from "react";

import { VEHICLE_TYPE_OPTIONS, VehicleType } from "@/hooks/use-vehicle";

export interface VehicleFieldsValue {
  vehicleType: VehicleType | "";
  brand: string;
  model: string;
  licensePlate: string;
}

interface VehicleFormFieldsProps {
  value: VehicleFieldsValue;
  onChange: (next: VehicleFieldsValue) => void;
  errors?: Partial<Record<keyof VehicleFieldsValue, string>>;
}

export const VehicleFormFields: React.FC<VehicleFormFieldsProps> = ({
  value,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-3">
      <Select
        errorMessage={errors?.vehicleType}
        isInvalid={!!errors?.vehicleType}
        label="Loại xe"
        placeholder="Chọn loại xe"
        selectedKeys={
          value.vehicleType ? new Set([value.vehicleType]) : new Set()
        }
        variant="bordered"
        onSelectionChange={(keys) =>
          onChange({
            ...value,
            vehicleType: (Array.from(keys)[0] as VehicleType) ?? "",
          })
        }
      >
        {VEHICLE_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.code}>{option.name}</SelectItem>
        ))}
      </Select>

      <Input
        errorMessage={errors?.brand}
        isInvalid={!!errors?.brand}
        label="Hãng xe"
        maxLength={100}
        placeholder="VD: Toyota"
        value={value.brand}
        variant="bordered"
        onValueChange={(brand) => onChange({ ...value, brand })}
      />

      <Input
        errorMessage={errors?.model}
        isInvalid={!!errors?.model}
        label="Hiệu xe"
        maxLength={100}
        placeholder="VD: Corolla"
        value={value.model}
        variant="bordered"
        onValueChange={(model) => onChange({ ...value, model })}
      />

      <Input
        errorMessage={errors?.licensePlate}
        isInvalid={!!errors?.licensePlate}
        label="Biển số xe"
        maxLength={20}
        placeholder="VD: 51H-123.45"
        value={value.licensePlate}
        variant="bordered"
        onValueChange={(licensePlate) => onChange({ ...value, licensePlate })}
      />
    </div>
  );
};
