import React from "react";
import { PATH } from "@/constants/path";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  UsersIcon,
  Calendar,
  Search,
  Settings,
  History,
  MessageSquarePlus,
  MessageCircle,
} from "lucide-react";

export const MENU_KEYS = {
  // Main App
  NEWS_FLOWCHART: "news-flowchart",
  GENERAL_FLOWCHART: "general-flowchart",

  // Manage
  HISTORY: "history",
  CALENDAR: "calendar",
  SEARCH: "search",
  SETTINGS: "settings",

  // Admin用
  DASHBOARD: "dashboard",
  USER_LIST: "user-list",

  // 共通
  LOGOUT: "logout",
} as const;

export type MenuKey = (typeof MENU_KEYS)[keyof typeof MENU_KEYS];

export interface SidebarItemConfig {
  label: string;
  path?: string;
  functionality?: () => void | Promise<void>;
  icon: React.ReactNode;
  activeColor?: string; // Additional property for current app styling
}

/**
 * サイドバーに表示するメニューの設定
 */
export const SIDEBAR_CONFIG: Record<MenuKey, SidebarItemConfig> = {
  // Main Items
  [MENU_KEYS.NEWS_FLOWCHART]: {
    label: "News Flowchart",
    path: PATH.HOME,
    icon: <MessageSquarePlus className="h-5 w-5" />,
    activeColor: "text-blue-600 dark:text-blue-400",
  },
  [MENU_KEYS.GENERAL_FLOWCHART]: {
    label: "General Flowchart",
    path: PATH.GENERAL,
    icon: <MessageCircle className="h-5 w-5" />,
    activeColor: "text-purple-600 dark:text-purple-400",
  },

  // Manage Items
  [MENU_KEYS.HISTORY]: {
    label: "History",
    path: PATH.HISTORY,
    icon: <History className="h-4.5 w-4.5" />,
  },
  [MENU_KEYS.CALENDAR]: {
    label: "Calendar",
    path: PATH.CALENDAR,
    icon: <Calendar className="h-4.5 w-4.5" />,
  },
  [MENU_KEYS.SEARCH]: {
    label: "Search",
    path: PATH.SEARCH,
    icon: <Search className="h-4.5 w-4.5" />,
  },
  [MENU_KEYS.SETTINGS]: {
    label: "Settings",
    path: PATH.SETTINGS,
    icon: <Settings className="h-4.5 w-4.5" />,
  },

  // Admin Items
  [MENU_KEYS.DASHBOARD]: {
    label: "ダッシュボード",
    path: PATH.ADMIN.DASHBOARD,
    icon: <LayoutDashboardIcon />,
  },
  [MENU_KEYS.USER_LIST]: {
    label: "ユーザー一覧",
    path: PATH.ADMIN.USER_LIST,
    icon: <UsersIcon />,
  },

  // Common Items
  [MENU_KEYS.LOGOUT]: {
    label: "ログアウト",
    functionality: async () => {
      alert("Logout functionality called");
    },
    icon: <LogOutIcon />,
  },
};

/**
 * メインメニューの順番
 */
export const mainSidebar: MenuKey[] = [
  MENU_KEYS.NEWS_FLOWCHART,
  MENU_KEYS.GENERAL_FLOWCHART,
];

/**
 * 管理メニューの順番
 */
export const manageSidebar: MenuKey[] = [
  MENU_KEYS.HISTORY,
  MENU_KEYS.CALENDAR,
  MENU_KEYS.SEARCH,
  MENU_KEYS.SETTINGS,
];

/**
 * 管理画面のサイドバーに表示するメニューの順番
 */
export const adminSidebar: MenuKey[] = [
  MENU_KEYS.DASHBOARD,
  MENU_KEYS.USER_LIST,
];

/**
 * サイドバーのフッターに表示するメニューの順番
 */
export const footerSidebar: MenuKey[] = [MENU_KEYS.LOGOUT];
