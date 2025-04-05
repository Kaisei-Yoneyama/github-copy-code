import { renderToMarkup } from "@/entrypoints/github.content/markup"
import { sendMessage } from "@/entrypoints/background/messaging"
import { parsePatch, type ParsedDiff } from "diff"
import ReactDOM from "react-dom/client"

// NOTE: `@primer/react` の依存関係である `@primer/live-region-element` で `customElements` が参照されているが、コンテンツスクリプトからは使用できずエラーになってしまうのでこれで代替
import "@webcomponents/custom-elements"

import "@primer/primitives/dist/css/functional/themes/light.css"
import { BaseStyles, ThemeProvider } from "@primer/react"

import { CopyButton } from "@/components/CopyButton"

export default defineContentScript({
  cssInjectionMode: "ui",

  matches: [
    "https://github.com/*/*/commit/*",
    "https://github.com/*/*/pull/*/files",
    "https://github.com/*/*/pull/*/commits/*",
  ],

  async main(ctx) {
    /*
     * 以下のパスのいずれでもない場合は終了する
     *
     * - `/{owner}/{repo}/commit/{commit_sha}`
     * - `/{owner}/{repo}/pull/{pull_number}/files`
     * - `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}`
     */
    if (
      !commitPathRegex.test(location.pathname) &&
      !pullFilesPathRegex.test(location.pathname) &&
      !pullCommitsPathRegex.test(location.pathname)
    ) {
      return
    }

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

        onMount: (container) => {
          const app = document.createElement("div")
          container.append(app)

          const root = ReactDOM.createRoot(app)
          root.render(
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
            </ThemeProvider>,
          )

          return root
        },

        onRemove: (root) => {
          root?.unmount()
        },
      })

      ui.mount()
    }
  },
})
