import type { ContentScriptContext } from "wxt/utils/content-script-context"
import { renderToMarkup } from "@/entrypoints/github.content/markup"
import { sendMessage } from "@/entrypoints/background/messaging"
import { parsePatch, type StructuredPatch } from "diff"
import type { ComponentProps } from "react"
import ReactDOM from "react-dom/client"

// NOTE: `@primer/react` の依存関係である `@primer/live-region-element` で `customElements` が参照されているが、コンテンツスクリプトからは使用できずエラーになってしまうのでこれで代替
import "@webcomponents/custom-elements"

import { StyleSheetManager } from "styled-components"
import { BaseStyles, ThemeProvider, ButtonGroup } from "@primer/react"

import { CopyButton } from "@/components/CopyButton"

import "@/entrypoints/github.content/style.css"

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

    ctx.addEventListener(
      window,
      "wxt:locationchange",
      async ({ newUrl, oldUrl }) => {
        if (oldUrl.pathname === newUrl.pathname) return
        await executeIfMatched(newUrl)
      },
    )
  },
})

const main = async (ctx: ContentScriptContext) => {
  const diffPath = toDiffPath(location.pathname)

  if (!diffPath) {
    return
  }

  let structuredPatch: StructuredPatch[]

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
    /*
     * ボタンを挿入する位置を探す
     * - コミットページ: コラプスボタンを基準として、その親要素の次の要素
     * - プルリクページ: ファイルリンクを基準として、その親要素
     */
    const collapseButton = document.querySelector(
      `button[aria-label="Collapse file: ${filePath}" i]`,
    )
    const fileLink = document.querySelector(`a[title="${filePath}"]`)
    const anchor =
      collapseButton?.parentElement?.nextElementSibling ??
      fileLink?.parentElement

    const ui = await createShadowRootUi(ctx, {
      name: `clipboard-copy-${browser.runtime.id}`,

      position: "inline",

      anchor,

      onMount: (container, shadow) => {
        type ThemeProviderProps = ComponentProps<typeof ThemeProvider>

        const {
          colorMode = "auto",
          lightTheme: dayScheme = "light",
          darkTheme: nightScheme = "dark",
        } = document.documentElement.dataset

        const app = document.createElement("div")
        container.append(app)

        const cssContainer = shadow.querySelector("head")!
        const root = ReactDOM.createRoot(app)
        root.render(
          <StyleSheetManager target={cssContainer}>
            <ThemeProvider
              // TODO: バリデーションを行い、型アサーションを外す
              colorMode={colorMode as ThemeProviderProps["colorMode"]}
              dayScheme={dayScheme as ThemeProviderProps["dayScheme"]}
              nightScheme={nightScheme as ThemeProviderProps["nightScheme"]}
            >
              <BaseStyles>
                {toRawContentPath(location.pathname, filePath) ? (
                  <ButtonGroup>
                    <CopyButton
                      id="copy-markup-button"
                      size="small"
                      text={() => renderToMarkup(patch)}
                      feedback="Copied!"
                    >
                      Copy markup
                    </CopyButton>
                    <CopyButton
                      id="copy-raw-content-button"
                      size="small"
                      text={async () => {
                        const rawContentPath = toRawContentPath(
                          location.pathname,
                          filePath,
                        )

                        if (!rawContentPath) {
                          throw new Error("Failed to get raw content path")
                        }

                        const rawContentUrl = new URL(
                          rawContentPath,
                          location.origin,
                        )
                        const rawContent = await sendMessage(
                          "fetchUrl",
                          rawContentUrl,
                        )
                        return rawContent
                      }}
                      feedback="Copied!"
                    >
                      Copy raw content
                    </CopyButton>
                  </ButtonGroup>
                ) : (
                  <CopyButton
                    id="copy-markup-button"
                    size="small"
                    text={() => renderToMarkup(patch)}
                    feedback="Copied!"
                  >
                    Copy markup
                  </CopyButton>
                )}
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
