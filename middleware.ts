import { NextRequest, NextResponse, URLPattern } from "next/server";
import { routes } from "./lib/routes/routes.config";
import { RouteConfig } from "./lib/routes/routes.type";
import { navigate } from "./lib/routes/routes.util";
import { CookieNames } from "./types/global.enum";

const routerPatterns = Object.values(routes).map((router: RouteConfig) => {
  return {
    private: router.private,
    pattern: new URLPattern({ pathname: router.pattern }),
  };
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const router = routerPatterns.find((router) =>
    router.pattern.test({ pathname }),
  );
  if (!router) return NextResponse.next();

  const session = request.cookies.get(CookieNames.Session)?.value;

  if (router.private && !session) {
    const loginUrl =
      navigate("/login") +
      "?redirect=" +
      encodeURIComponent(request.nextUrl.href);
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  if (router.private === false && session) {
    // Redirect to shared page
    return NextResponse.redirect(new URL(navigate("/dashboard"), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|svg).*)",
  ],
};
