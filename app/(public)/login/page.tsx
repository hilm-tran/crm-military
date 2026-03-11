"use client";

import { useAuth } from "@/hooks/use-auth";
import { navigate } from "@/lib/routes/routes.util";
import { Button, Card, Form, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn(data);
      // Redirect to the intended page or soldiers
      router.replace(redirect || navigate("/soldiers"));
      router.refresh(); // Refresh to update middleware state
    } catch (error) {
      setError("root", {
        message: "Số hiệu sĩ quan hoặc mật khẩu không đúng",
      });
    }
  });

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <Card className="w-[400px] p-8">
        <Form className="space-y-4" onSubmit={onSubmit}>
          <h1 className="text-xl font-bold text-center w-full mb-2">
            Hệ thống kiểm soát ra vào
          </h1>

          {errors.root && (
            <p className="text-danger text-sm text-center">
              {errors.root.message}
            </p>
          )}

          <Input
            {...register("username", { required: "Vui lòng nhập username" })}
            errorMessage={errors.username?.message}
            isInvalid={!!errors.username}
            label="Username"
            placeholder="Nhập username"
          />

          <Input
            {...register("password", { required: "Vui lòng nhập password" })}
            errorMessage={errors.password?.message}
            isInvalid={!!errors.password}
            label="Password"
            placeholder="Nhập password"
            type={showPassword ? "text" : "password"}
            endContent={
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer"
              />
            }
          />

          <Button
            className="w-full"
            color="primary"
            isLoading={isSubmitting}
            type="submit"
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
}
