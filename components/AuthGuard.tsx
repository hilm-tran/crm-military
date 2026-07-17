"use client";

import { CookieNames } from "@/types/global.enum";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

/**
 * Client-side route guard for the private section.
 * Static export (S3/CloudFront) has no server to run middleware, so the
 * session-cookie check that used to live in middleware.ts happens here instead.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = Cookies.get(CookieNames.Session);
    if (!session) {
      const redirect = encodeURIComponent(
        pathname + window.location.search,
      );
      router.replace(`/login?redirect=${redirect}`);
      return;
    }
    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized) return null;
  return <>{children}</>;
}
