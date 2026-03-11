export const routes = {
  "/login": {
    router: "/login",
    filePath: "(public)/login",
    pattern: "/login",
    private: false,
  },
  "/add-soldier": {
    router: "/add-soldier",
    filePath: "(private)/add-soldier",
    pattern: "/add-soldier",
    private: true,
  },
  "/dashboard": {
    router: "/dashboard",
    filePath: "(private)/dashboard",
    pattern: "/dashboard",
    private: true,
  },
  "/history": {
    router: "/history",
    filePath: "(private)/history",
    pattern: "/history",
    private: true,
  },
  "/requests": {
    router: "/requests",
    filePath: "(private)/requests",
    pattern: "/requests",
    private: true,
  },
  "/soldiers": {
    router: "/soldiers",
    filePath: "(private)/soldiers",
    pattern: "/soldiers",
    private: true,
  },
} as const;

// List of all route keys
export const routeKeys = [
  "/login",
  "/add-soldier",
  "/dashboard",
  "/history",
  "/requests",
  "/soldiers",
] as const;

// List of all route patterns
export const routePatterns = [
  "/login",
  "/add-soldier",
  "/dashboard",
  "/history",
  "/requests",
  "/soldiers",
] as const;
