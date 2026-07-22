"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageUpload } from "./ImageUpload";
import { VehicleFieldsValue, VehicleFormFields } from "./VehicleFormFields";
import { VehicleImagesUpload } from "./VehicleImagesUpload";

import { useSoldier } from "@/hooks/use-soldier";
import { useCombobox } from "@/hooks/use-combobox";

interface AddSoldierModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  username: string;
  email: string;
  password: string;
  fullName: string;
  rankCode: string;
  unitCode: string;
  positionCode: string;
  imagePath: string;
  hasVehicle: boolean;
  vehicle: VehicleFieldsValue;
  vehicleImagePaths: string[];
}

const EMPTY_VEHICLE: VehicleFieldsValue = {
  vehicleType: "",
  brand: "",
  model: "",
  licensePlate: "",
};

export const AddSoldierModal: React.FC<AddSoldierModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { createSoldier } = useSoldier();
  const { getRanks, getPositions, getUnits } = useCombobox();
  const [showPassword, setShowPassword] = useState(false);
  const [ranks, setRanks] = useState<{ code: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [units, setUnits] = useState<{ code: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      rankCode: "",
      unitCode: "",
      positionCode: "",
      imagePath: "",
      hasVehicle: false,
      vehicle: EMPTY_VEHICLE,
      vehicleImagePaths: [],
    },
  });

  const hasVehicle = watch("hasVehicle");
  const vehicle = watch("vehicle");
  const vehicleImagePaths = watch("vehicleImagePaths");

  // Load combobox data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    getRanks().then(setRanks);
    getPositions().then(setPositions);
    getUnits().then(setUnits);
  }, [isOpen, getRanks, getPositions, getUnits]);

  const onSubmit = handleSubmit(async (data) => {
    if (data.hasVehicle) {
      let hasVehicleError = false;

      (["vehicleType", "brand", "model", "licensePlate"] as const).forEach(
        (field) => {
          if (!data.vehicle[field]) {
            setError(`vehicle.${field}`, { message: "Bắt buộc" });
            hasVehicleError = true;
          } else {
            clearErrors(`vehicle.${field}`);
          }
        },
      );
      if (hasVehicleError) return;
    }

    try {
      await createSoldier({
        username: data.username,
        email: data.email,
        password: data.password,
        role: ["ROLE_USER"],
        militaryPersonnel: {
          fullName: data.fullName,
          rankCode: data.rankCode,
          unitCode: data.unitCode,
          positionCode: data.positionCode,
          imagePath: data.imagePath || undefined,
          vehicle: data.hasVehicle
            ? {
                vehicleType: data.vehicle.vehicleType,
                brand: data.vehicle.brand,
                model: data.vehicle.model,
                licensePlate: data.vehicle.licensePlate,
                imagePaths: data.vehicleImagePaths.length
                  ? data.vehicleImagePaths
                  : undefined,
              }
            : undefined,
        },
      });
      onOpenChange();
      reset();
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      placement="top-center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={onSubmit}
          >
            <ModalHeader>Thêm quân nhân mới</ModalHeader>
            <ModalBody className="gap-4 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  <p className="font-medium text-xs text-default-500 uppercase">
                    Tài khoản
                  </p>
                  <Input
                    {...register("username", { required: "Bắt buộc" })}
                    errorMessage={errors.username?.message}
                    isInvalid={!!errors.username}
                    label="Username"
                    placeholder="Nhập username"
                    variant="bordered"
                  />
                  <Input
                    {...register("email", {
                      required: "Bắt buộc",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email không hợp lệ",
                      },
                    })}
                    errorMessage={errors.email?.message}
                    isInvalid={!!errors.email}
                    label="Email"
                    placeholder="Nhập email"
                    variant="bordered"
                  />
                  <Input
                    {...register("password", { required: "Bắt buộc" })}
                    endContent={
                      <Icon
                        className="cursor-pointer"
                        icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    }
                    errorMessage={errors.password?.message}
                    isInvalid={!!errors.password}
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                  />

                  <p className="font-medium text-xs text-default-500 uppercase pt-2">
                    Thông tin quân nhân
                  </p>
                  <Input
                    {...register("fullName", { required: "Bắt buộc" })}
                    errorMessage={errors.fullName?.message}
                    isInvalid={!!errors.fullName}
                    label="Họ tên"
                    variant="bordered"
                  />

                  <Controller
                    control={control}
                    name="rankCode"
                    render={({ field }) => (
                      <Select
                        errorMessage={errors.rankCode?.message}
                        isInvalid={!!errors.rankCode}
                        label="Cấp bậc"
                        selectedKeys={
                          field.value ? new Set([field.value]) : new Set()
                        }
                        variant="bordered"
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)[0] ?? "")
                        }
                      >
                        {ranks.map((r) => (
                          <SelectItem key={r.code}>{r.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                    rules={{ required: "Bắt buộc" }}
                  />

                  <Controller
                    control={control}
                    name="positionCode"
                    render={({ field }) => (
                      <Select
                        errorMessage={errors.positionCode?.message}
                        isInvalid={!!errors.positionCode}
                        label="Chức vụ"
                        selectedKeys={
                          field.value ? new Set([field.value]) : new Set()
                        }
                        variant="bordered"
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)[0] ?? "")
                        }
                      >
                        {positions.map((p) => (
                          <SelectItem key={p.code}>{p.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                    rules={{ required: "Bắt buộc" }}
                  />

                  <Controller
                    control={control}
                    name="unitCode"
                    render={({ field }) => (
                      <Select
                        errorMessage={errors.unitCode?.message}
                        isInvalid={!!errors.unitCode}
                        label="Đơn vị"
                        placeholder="Chọn đơn vị"
                        selectedKeys={
                          field.value ? new Set([field.value]) : new Set()
                        }
                        variant="bordered"
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)[0] ?? "")
                        }
                      >
                        {units.map((u) => (
                          <SelectItem key={u.code}>{u.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                    rules={{ required: "Bắt buộc" }}
                  />
                </div>

                {/* Right column - image */}
                <div className="space-y-2">
                  <p className="font-medium text-xs text-default-500 uppercase">
                    Ảnh đại diện
                  </p>
                  <ImageUpload
                    onUploadSuccess={(path) => setValue("imagePath", path)}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-default-100">
                <div className="flex items-center justify-between pt-2">
                  <p className="font-medium text-xs text-default-500 uppercase">
                    Phương tiện
                  </p>
                  <Controller
                    control={control}
                    name="hasVehicle"
                    render={({ field }) => (
                      <Switch
                        isSelected={field.value}
                        size="sm"
                        onValueChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            clearErrors("vehicle");
                          }
                        }}
                      >
                        Gán phương tiện cho quân nhân
                      </Switch>
                    )}
                  />
                </div>

                {hasVehicle && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <VehicleFormFields
                      errors={{
                        vehicleType: errors.vehicle?.vehicleType?.message,
                        brand: errors.vehicle?.brand?.message,
                        model: errors.vehicle?.model?.message,
                        licensePlate: errors.vehicle?.licensePlate?.message,
                      }}
                      value={vehicle}
                      onChange={(next) => setValue("vehicle", next)}
                    />
                    <div className="space-y-2">
                      <p className="font-medium text-xs text-default-500 uppercase">
                        Ảnh phương tiện
                      </p>
                      <VehicleImagesUpload
                        imagePaths={vehicleImagePaths}
                        onChange={(paths) =>
                          setValue("vehicleImagePaths", paths)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Hủy
              </Button>
              <Button color="primary" isLoading={isSubmitting} type="submit">
                Lưu
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
