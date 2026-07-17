"use client";

import { CookieNames } from "@/types/global.enum";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = Cookies.get(CookieNames.Session);
    router.replace(session ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
