"use client";

import { CookieNames } from "@/types/global.enum";
import { addToast } from "@heroui/toast";
import Cookies from "js-cookie";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export type SignInParams = {
  username?: string;
  password?: string;
};

export const useAuth = () => {
  const signIn = async (data: SignInParams) => {
    try {
      const response = await fetch(`${BASE_API}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Đăng nhập thất bại");
      }

      const result = await response.json();

      // Save session to cookies
      // Assuming result contains metadata or token that should be stored
      // The user specified "response của login sẽ được lưu ở trong cookies"
      // We'll store the whole response or a specific field if it's a token.
      // For now, let's store the result as a string if it's an object, or as is.
      const cookieValue =
        typeof result === "string" ? result : JSON.stringify(result.data);

      Cookies.set(CookieNames.Session, cookieValue, {
        expires: 7, // 7 days
        path: "/",
      });

      return result;
    } catch (error) {
      console.error("Login Error:", error);
      addToast({
        title: "Lỗi đăng nhập",
        description: "Số hiệu sĩ quan hoặc mật khẩu không đúng",
        variant: "flat",
        color: "danger",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${BASE_API}/api/auth/signout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Sign-out API Error:", error);
      addToast({
        title: "Lỗi đăng xuất",
        description: "Không thể kết nối với máy chủ",
        variant: "flat",
        color: "danger",
      });
    } finally {
      Cookies.remove(CookieNames.Session, { path: "/" });
    }
  };

  return {
    signIn,
    signOut,
  };
};
