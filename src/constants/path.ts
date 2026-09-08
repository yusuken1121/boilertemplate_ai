/**
 * Application routes.
 * Adding one here is step 1 of `.cursor/skills/sidebar-management/SKILL.md`.
 */
export const PATH = {
  HOME: "/",
  CONTACT: "/contact",
  SETTINGS: "/settings",
  SIGN_IN: "/sign-in",
} as const

export type AppPath = (typeof PATH)[keyof typeof PATH]
