import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  webExt: {
    startUrls: [
      "https://github.com/Kaisei-Yoneyama/github-copy-code/pull/4/files",
      "https://github.com/Kaisei-Yoneyama/github-copy-code/pull/4/commits/60697586657907de592a34eee735f7b56079fd55",
      "https://github.com/Kaisei-Yoneyama/github-copy-code/commit/60697586657907de592a34eee735f7b56079fd55",
    ],
  },
  modules: ["@wxt-dev/module-react"],
  manifest: {
    host_permissions: ["*://*.github.com/*", "*://*.githubusercontent.com/*"],
    permissions: ["downloads"],
    /*
     * コンテンツスクリプトからサンドボックスを読み込むために必要
     * ポップアップの場合は不要
     */
    web_accessible_resources: [
      {
        resources: ["template-renderer.html"],
        matches: ["*://*.github.com/*"],
      },
    ],
  },
  /*
   * 開発環境のみ必要
   * サンドボックスから Vite 開発サーバーのモジュールを読み込む際の CORS ブロックを回避する
   */
  vite: () => ({
    server: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  }),
})
