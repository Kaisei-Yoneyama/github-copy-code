import type { ContentScriptContext } from "wxt/utils/content-script-context"
import { renderToMarkup } from "@/entrypoints/github.content/markup"
import { sendMessage } from "@/entrypoints/background/messaging"
import { parsePatch, type StructuredPatch } from "diff"
import type { ComponentProps } from "react"
import ReactDOM from "react-dom/client"

// NOTE: `@primer/react` の依存関係である `@primer/live-region-element` で `customElements` が参照されているが、コンテンツスクリプトからは使用できずエラーになってしまうのでこれで代替
import "@webcomponents/custom-elements"

import { StyleSheetManager } from "styled-components"
import { BaseStyles, ThemeProvider } from "@primer/react"

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

async function main(ctx: ContentScriptContext) {
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
    const ui = await createShadowRootUi(ctx, {
      name: `clipboard-copy-${browser.runtime.id}`,

      position: "inline",

      anchor: [
        `[aria-label="Collapse file: ${filePath}" i] + *`,
        `:has(> [title="${filePath}"])`,
      ].join(","),

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
                <CopyButton
                  size="small"
                  text={() => renderToMarkup(patch)}
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
