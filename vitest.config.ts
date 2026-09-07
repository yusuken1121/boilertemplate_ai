import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Node: Core, Use Cases, Infrastructure and schemas have no DOM dependency.
    // To test React components, install `jsdom` + `@testing-library/react`
    // and switch to `projects` with a jsdom project for `**/*.spec.tsx`.
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
