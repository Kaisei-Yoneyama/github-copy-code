import { vi } from "vitest"

// idb のモック
vi.mock("idb", () => ({
  openDB: vi.fn(),
}))

// @webext-core/proxy-service のモック
vi.mock("@webext-core/proxy-service", () => ({
  defineProxyService: vi.fn(() => [vi.fn(), vi.fn()]),
}))

// wxt/browser のモック
vi.mock("wxt/browser", async () => {
  const { fakeBrowser } = await import("wxt/testing")
  fakeBrowser.runtime.getManifest = vi.fn(() => ({}))
  return { browser: fakeBrowser }
})
