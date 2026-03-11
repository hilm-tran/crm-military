"use client";

import { useSoldier } from "@/hooks/use-soldier";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";

interface AddSoldierModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export const AddSoldierModal: React.FC<AddSoldierModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { createSoldier } = useSoldier();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      rankCode: "",
      unitCode: "",
      positionCode: "",
      imagePath: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createSoldier({
        username: data.username,
        email: data.email,
        password: data.password,
        role: ["user"],
        militaryPersonnel: {
          fullName: data.fullName,
          rankCode: data.rankCode,
          unitCode: data.unitCode,
          positionCode: data.positionCode,
          imagePath: data.imagePath,
        },
      });
      onOpenChange();
      reset();
      onSuccess?.();
    } catch (error) {
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
            <ModalHeader className="flex flex-col gap-1">
              Thêm quân nhân mới
            </ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-500 uppercase">
                    Thông tin tài khoản
                  </h3>
                  <Input
                    {...register("username", {
                      required: "Vui lòng nhập số hiệu",
                    })}
                    errorMessage={errors.username?.message}
                    isInvalid={!!errors.username}
                    label="Username"
                    placeholder="Nhập username"
                    variant="bordered"
                  />
                  <Input
                    {...register("email", {
                      required: "Vui lòng nhập email",
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
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                    })}
                    errorMessage={errors.password?.message}
                    isInvalid={!!errors.password}
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
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

                  <h3 className="font-medium text-sm text-gray-500 uppercase">
                    Thông tin cá nhân
                  </h3>
                  <Input
                    {...register("fullName", {
                      required: "Vui lòng nhập họ tên",
                    })}
                    errorMessage={errors.fullName?.message}
                    isInvalid={!!errors.fullName}
                    label="Họ tên"
                    placeholder="Nhập họ tên"
                    variant="bordered"
                  />
                  <Input
                    {...register("rankCode", {
                      required: "Vui lòng nhập cấp bậc",
                    })}
                    errorMessage={errors.rankCode?.message}
                    isInvalid={!!errors.rankCode}
                    label="Cấp bậc"
                    placeholder="VD: Đại úy"
                    variant="bordered"
                  />
                  <Input
                    {...register("unitCode", {
                      required: "Vui lòng nhập đơn vị",
                    })}
                    errorMessage={errors.unitCode?.message}
                    isInvalid={!!errors.unitCode}
                    label="Đơn vị"
                    placeholder="VD: Sư đoàn 1"
                    variant="bordered"
                  />
                  <Input
                    {...register("positionCode", {
                      required: "Vui lòng nhập chức vụ",
                    })}
                    errorMessage={errors.positionCode?.message}
                    isInvalid={!!errors.positionCode}
                    label="Chức vụ"
                    placeholder="VD: Đại đội trưởng"
                    variant="bordered"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500 uppercase">
                    Ảnh đại diện
                  </h3>
                  <ImageUpload
                    onUploadSuccess={(path) => setValue("imagePath", path)}
                  />
                  {errors.imagePath && (
                    <p className="text-danger text-xs">
                      {errors.imagePath.message}
                    </p>
                  )}
                </div>
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
