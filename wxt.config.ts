import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    host_permissions: ["*://*.github.com/*", "*://*.githubusercontent.com/*"],
    permissions: ["downloads"],
  },
})
