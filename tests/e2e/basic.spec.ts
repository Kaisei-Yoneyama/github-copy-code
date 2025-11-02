import type { Page } from "@playwright/test"
import { expect, test } from "./fixtures"

const EXPECTED_CLIPBOARD_TEXT = `
<!-- Sample template -->
\`\`\`diff-tsx filePath=entrypoints/github.content/index.tsx newStart=39 oldStart=39
 
     await executeIfMatched(location)
 
-    ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
-      await executeIfMatched(newUrl)
-    })
+    ctx.addEventListener(
+      window,
+      "wxt:locationchange",
+      async ({ newUrl, oldUrl }) => {
+        if (oldUrl.pathname === newUrl.pathname) return
+        await executeIfMatched(newUrl)
+      },
+    )
   },
 })
 
\`\`\`
`
const TEST_CASES = [
  {
    name: "/{owner}/{repo}/pull/{pull_number}/files",
    url: "https://github.com/Kaisei-Yoneyama/github-copy-code/pull/4/files",
  },
  {
    name: "/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}",
    url: "https://github.com/Kaisei-Yoneyama/github-copy-code/pull/4/commits/60697586657907de592a34eee735f7b56079fd55",
  },
  {
    name: "/{owner}/{repo}/commit/{commit_sha}",
    url: "https://github.com/Kaisei-Yoneyama/github-copy-code/commit/60697586657907de592a34eee735f7b56079fd55",
  },
]

test.describe("GitHub Copy Code Extension", () => {
  TEST_CASES.forEach(({ name, url }) => {
    test(`${name} でコピーボタンが表示される`, async ({
      page,
      extensionId,
    }) => {
      await page.goto(url)
      const copyButton = getCopyButtonLocator(page, extensionId)
      await expect(copyButton).toBeVisible()
    })

    test(`${name} でコピーボタンをクリックすると差分がクリップボードにコピーされる`, async ({
      page,
      extensionId,
      context,
    }) => {
      await page.goto(url)
      await context.grantPermissions(["clipboard-read", "clipboard-write"])

      await clickCopyButtonInShadowDOM(page, extensionId)

      await expect
        .poll(
          async () => {
            return await getClipboardText(page)
          },
          {
            message: "waiting for text to be copied to clipboard",
            timeout: 3000,
          },
        )
        .toBe(EXPECTED_CLIPBOARD_TEXT)
    })
  })
})

function getCopyButtonLocator(page: Page, extensionId: string) {
  return page.locator(`clipboard-copy-${extensionId}`)
}

async function clickCopyButtonInShadowDOM(page: Page, extensionId: string) {
  const shadowHost = getCopyButtonLocator(page, extensionId)
  await shadowHost.waitFor({ state: "attached" })

  await shadowHost.evaluate((host: Element) => {
    const shadowRoot = host.shadowRoot
    if (!shadowRoot) throw new Error("Shadow root not found")

    const copyButton = shadowRoot.getElementById("copy-markup-button")
    if (!copyButton) throw new Error("Copy button not found")

    copyButton.click()
  })
}

async function getClipboardText(page: Page) {
  return await page.evaluate(async () => {
    return await navigator.clipboard.readText()
  })
}
