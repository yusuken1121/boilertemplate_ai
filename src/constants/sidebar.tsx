import { LogOutIcon, Mail, MessageSquare, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PATH } from "@/constants/path"

export const MENU_KEYS = {
  CHAT: "chat",
  CONTACT: "contact",
  SETTINGS: "settings",
  LOGOUT: "logout",
} as const

export type MenuKey = (typeof MENU_KEYS)[keyof typeof MENU_KEYS]

export interface SidebarItemConfig {
  label: string
  /** A navigable route. Mutually exclusive with `onSelect`. */
  path?: string
  /** An action instead of a link (sign out, open a dialog, …). */
  onSelect?: () => void | Promise<void>
  icon: LucideIcon
  /** Tailwind text color applied while the route is active. */
  activeColor?: string
}

export const SIDEBAR_CONFIG: Record<MenuKey, SidebarItemConfig> = {
  [MENU_KEYS.CHAT]: {
    label: "Chat",
    path: PATH.HOME,
    icon: MessageSquare,
    activeColor: "text-blue-600 dark:text-blue-400",
  },
  [MENU_KEYS.CONTACT]: {
    label: "Contact",
    path: PATH.CONTACT,
    icon: Mail,
    activeColor: "text-green-600 dark:text-green-400",
  },
  [MENU_KEYS.SETTINGS]: {
    label: "Settings",
    path: PATH.SETTINGS,
    icon: Settings,
  },
  [MENU_KEYS.LOGOUT]: {
    label: "Logout",
    icon: LogOutIcon,
    onSelect: () => {
      alert("Logout functionality called")
    },
  },
}

export const mainSidebar: MenuKey[] = [MENU_KEYS.CHAT, MENU_KEYS.CONTACT]
export const manageSidebar: MenuKey[] = [MENU_KEYS.SETTINGS]
export const adminSidebar: MenuKey[] = []
export const footerSidebar: MenuKey[] = [MENU_KEYS.LOGOUT]
