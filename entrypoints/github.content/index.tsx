import type { ContentScriptContext } from "wxt/utils/content-script-context"
import { renderToMarkup } from "@/entrypoints/github.content/markup"
import { sendMessage } from "@/entrypoints/background/messaging"
import { parsePatch, type ParsedDiff } from "diff"
import ReactDOM from "react-dom/client"

// NOTE: `@primer/react` の依存関係である `@primer/live-region-element` で `customElements` が参照されているが、コンテンツスクリプトからは使用できずエラーになってしまうのでこれで代替
import "@webcomponents/custom-elements"

import { StyleSheetManager } from "styled-components"

import "@primer/primitives/dist/css/functional/themes/light.css"
import { BaseStyles, ThemeProvider } from "@primer/react"

import { CopyButton } from "@/components/CopyButton"

export default defineContentScript({
  cssInjectionMode: "ui",

  matches: ["https://github.com/*"],

  async main(ctx) {
    const matchPatterns = [
      new MatchPattern("https://github.com/*/*/commit/*"),
      new MatchPattern("https://github.com/*/*/pull/*/files"),
      new MatchPattern("https://github.com/*/*/pull/*/commits/*"),
    ]

    const executeIfMatched = async (url: URL | Location) => {
      const isMatch = matchPatterns.some((matchPattern) =>
        matchPattern.includes(url),
      )

      if (isMatch) {
        await main(ctx)
      }
    }

    await executeIfMatched(location)

    ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
      await executeIfMatched(newUrl)
    })
  },
})

async function main(ctx: ContentScriptContext) {
  const diffPath = toDiffPath(location.pathname)

  if (!diffPath) {
    return
  }

  let structuredPatch: ParsedDiff[]

  try {
    const diffUrl = new URL(diffPath, location.origin)
    const uniDiff = await sendMessage("fetchUrl", diffUrl)
    structuredPatch = parsePatch(uniDiff)
  } catch {
    return
  }

  const patchMap = new Map(
    structuredPatch.map((patch) => {
      const filePath = getFilePath(patch)
      return [filePath, patch]
    }),
  )

  for (const [filePath, patch] of patchMap) {
    const ui = await createShadowRootUi(ctx, {
      name: `clipboard-copy-${browser.runtime.id}`,

      position: "inline",

      anchor: [
        `[aria-label="collapse file: ${filePath}"] + *`,
        `:has(> [title="${filePath}"])`,
      ].join(","),

      onMount: (container, shadow) => {
        const app = document.createElement("div")
        container.append(app)

        const cssContainer = shadow.querySelector("head")!
        const root = ReactDOM.createRoot(app)
        root.render(
          <StyleSheetManager target={cssContainer}>
            <ThemeProvider>
              <BaseStyles>
                <CopyButton
                  size="small"
                  text={renderToMarkup(patch)}
                  feedback="Copied!"
                >
                  Copy markup
                </CopyButton>
              </BaseStyles>
            </ThemeProvider>
          </StyleSheetManager>,
        )

        return root
      },

      onRemove: (root) => {
        root?.unmount()
      },
    })

    ui.mount()
  }
}
