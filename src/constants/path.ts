/**
 * アプリケーションのルート定義
 */
export const PATH = {
  HOME: "/",
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USER_LIST: "/admin/users",
    USER_DETAIL: "/admin/users/:user_id",
  },
  LOGIN: "/login",
  GENERAL: "/general",
  HISTORY: "/history",
  CALENDAR: "/calendar",
  SEARCH: "/search",
  SETTINGS: "/settings",
} as const;
