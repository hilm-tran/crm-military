"use client";

import { useAuth } from "@/hooks/use-auth";
import { navigate } from "@/lib/routes/routes.util";
import { CookieNames } from "@/types/global.enum";
import { Button, Card, Form, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (Cookies.get(CookieNames.Session)) {
      router.replace(redirect || navigate("/dashboard"));
    }
    // Only check once on mount — avoid fighting the just-signed-in redirect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (error) {
      setError("root", {
        message: "Số hiệu sĩ quan hoặc mật khẩu không đúng",
      });
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-default-50">
      {/* Brand panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-b from-[#20281a] to-[#14170f] p-12 text-white">
        <div className="absolute inset-0 bg-tactical-grid opacity-60" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-secondary-400/40 bg-white/5">
            <Icon icon="mdi:shield-star-outline" className="text-2xl text-secondary-400" />
          </div>
          <span className="text-base font-bold tracking-wide">MILITARY MANAGER</span>
        </div>

        <div className="relative max-w-md">
          <Icon icon="mdi:shield-check-outline" className="mb-6 text-5xl text-secondary-400" />
          <h1 className="text-3xl font-bold leading-tight">
            Hệ thống quản lý &amp; kiểm soát ra vào doanh trại
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Quản lý quân số, phê duyệt nghỉ phép và giám sát ra vào cổng theo thời
            gian thực — tập trung, minh bạch, đúng phân cấp chỉ huy.
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Military Manager. Chỉ dành cho nhân sự được cấp quyền.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-[420px] p-8">
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-secondary-400/40 bg-primary-900/5">
              <Icon icon="mdi:shield-star-outline" className="text-2xl text-secondary-500" />
            </div>
            <span className="text-sm font-bold tracking-wide text-foreground">
              MILITARY MANAGER
            </span>
          </div>

          <Form className="space-y-4" onSubmit={onSubmit}>
            <div className="w-full mb-2 text-center">
              <h1 className="text-xl font-bold">Đăng nhập hệ thống</h1>
              <p className="mt-1 text-sm text-default-500">
                Hệ thống kiểm soát ra vào
              </p>
            </div>

            {errors.root && (
              <p className="text-danger text-sm text-center w-full">
                {errors.root.message}
              </p>
            )}

            <Input
              {...register("username", { required: "Vui lòng nhập username" })}
              errorMessage={errors.username?.message}
              isInvalid={!!errors.username}
              label="Số hiệu / Username"
              placeholder="Nhập username"
              startContent={<Icon icon="mdi:account-outline" className="text-default-400" />}
            />

            <Input
              {...register("password", { required: "Vui lòng nhập password" })}
              errorMessage={errors.password?.message}
              isInvalid={!!errors.password}
              label="Mật khẩu"
              placeholder="Nhập password"
              type={showPassword ? "text" : "password"}
              startContent={<Icon icon="mdi:lock-outline" className="text-default-400" />}
              endContent={
                <Icon
                  icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-default-400"
                />
              }
            />

            <Button
              className="w-full"
              color="primary"
              isLoading={isSubmitting}
              type="submit"
              startContent={!isSubmitting && <Icon icon="mdi:login-variant" />}
            >
              Đăng nhập
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
