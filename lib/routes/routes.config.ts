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
  "/scan": {
    router: "/scan",
    filePath: "(private)/scan",
    pattern: "/scan",
    private: true,
  },
  "/regions": {
    router: "/regions",
    filePath: "(private)/regions",
    pattern: "/regions",
    private: true,
  },
  "/units": {
    router: "/units",
    filePath: "(private)/units",
    pattern: "/units",
    private: true,
  },
  "/submission-groups": {
    router: "/submission-groups",
    filePath: "(private)/submission-groups",
    pattern: "/submission-groups",
    private: true,
  },
  "/submission-flows": {
    router: "/submission-flows",
    filePath: "(private)/submission-flows",
    pattern: "/submission-flows",
    private: true,
  },
  "/leave-approval-configs": {
    router: "/leave-approval-configs",
    filePath: "(private)/leave-approval-configs",
    pattern: "/leave-approval-configs",
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
  "/scan",
  "/regions",
  "/units",
  "/submission-groups",
  "/submission-flows",
  "/leave-approval-configs",
] as const;

// List of all route patterns
export const routePatterns = [
  "/login",
  "/add-soldier",
  "/dashboard",
  "/history",
  "/requests",
  "/soldiers",
  "/scan",
  "/regions",
  "/units",
  "/submission-groups",
  "/submission-flows",
  "/leave-approval-configs",
] as const;
