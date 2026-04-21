"use client";

import { useCombobox } from "@/hooks/use-combobox";
import { useSoldier } from "@/hooks/use-soldier";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";

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
  regionCode: string;
  unitCode: string;
  positionCode: string;
  imagePath: string;
}

export const AddSoldierModal: React.FC<AddSoldierModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { createSoldier } = useSoldier();
  const { getRanks, getPositions, getRegions, getUnits } = useCombobox();
  const [showPassword, setShowPassword] = useState(false);
  const [ranks, setRanks] = useState<{ code: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ code: string; name: string }[]>([]);
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ code: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      rankCode: "",
      regionCode: "",
      unitCode: "",
      positionCode: "",
      imagePath: "",
    },
  });

  const selectedRegion = watch("regionCode");

  // Load combobox data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    getRanks().then(setRanks);
    getPositions().then(setPositions);
    getRegions().then(setRegions);
  }, [isOpen, getRanks, getPositions, getRegions]);

  // Reload units when region changes
  useEffect(() => {
    if (!selectedRegion) { setUnits([]); return; }
    setValue("unitCode", "");
    getUnits(selectedRegion).then(setUnits);
  }, [selectedRegion, getUnits, setValue]);

  const onSubmit = handleSubmit(async (data) => {
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
      onOpenChange={onOpenChange}
      placement="top-center"
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={onSubmit}>
            <ModalHeader>Thêm quân nhân mới</ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  <p className="font-medium text-xs text-gray-500 uppercase">Tài khoản</p>
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
                      pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
                    })}
                    errorMessage={errors.email?.message}
                    isInvalid={!!errors.email}
                    label="Email"
                    placeholder="Nhập email"
                    variant="bordered"
                  />
                  <Input
                    {...register("password", { required: "Bắt buộc" })}
                    errorMessage={errors.password?.message}
                    isInvalid={!!errors.password}
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                    endContent={
                      <Icon
                        icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer"
                      />
                    }
                  />

                  <p className="font-medium text-xs text-gray-500 uppercase pt-2">Thông tin quân nhân</p>
                  <Input
                    {...register("fullName", { required: "Bắt buộc" })}
                    errorMessage={errors.fullName?.message}
                    isInvalid={!!errors.fullName}
                    label="Họ tên"
                    variant="bordered"
                  />

                  <Controller
                    name="rankCode"
                    control={control}
                    rules={{ required: "Bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        label="Cấp bậc"
                        variant="bordered"
                        selectedKeys={field.value ? new Set([field.value]) : new Set()}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] ?? "")}
                        isInvalid={!!errors.rankCode}
                        errorMessage={errors.rankCode?.message}
                      >
                        {ranks.map((r) => (
                          <SelectItem key={r.code}>{r.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="positionCode"
                    control={control}
                    rules={{ required: "Bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        label="Chức vụ"
                        variant="bordered"
                        selectedKeys={field.value ? new Set([field.value]) : new Set()}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] ?? "")}
                        isInvalid={!!errors.positionCode}
                        errorMessage={errors.positionCode?.message}
                      >
                        {positions.map((p) => (
                          <SelectItem key={p.code}>{p.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="regionCode"
                    control={control}
                    rules={{ required: "Bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        label="Quân khu"
                        variant="bordered"
                        selectedKeys={field.value ? new Set([field.value]) : new Set()}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] ?? "")}
                        isInvalid={!!errors.regionCode}
                        errorMessage={errors.regionCode?.message}
                      >
                        {regions.map((r) => (
                          <SelectItem key={r.code}>{r.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="unitCode"
                    control={control}
                    rules={{ required: "Bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        label="Đơn vị"
                        variant="bordered"
                        isDisabled={!selectedRegion}
                        placeholder={selectedRegion ? "Chọn đơn vị" : "Chọn quân khu trước"}
                        selectedKeys={field.value ? new Set([field.value]) : new Set()}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] ?? "")}
                        isInvalid={!!errors.unitCode}
                        errorMessage={errors.unitCode?.message}
                      >
                        {units.map((u) => (
                          <SelectItem key={u.code}>{u.name}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                {/* Right column - image */}
                <div className="space-y-2">
                  <p className="font-medium text-xs text-gray-500 uppercase">Ảnh đại diện</p>
                  <ImageUpload
                    onUploadSuccess={(path) => setValue("imagePath", path)}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>Hủy</Button>
              <Button color="primary" isLoading={isSubmitting} type="submit">Lưu</Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
