import type { ParsedDiff } from "diff"
import mustache from "mustache"

// すべてのエスケープを無効化する
mustache.escape = (text) => text

// TODO: テンプレートをポップアップで編集できるようにする
const template = `
{{#hunkList}}
{{#collapseWhitespace}}~~~{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
{{code}}
~~~
{{/hunkList}}
`

export const renderToMarkup = ({
  newFileName = "",
  oldFileName = "",
  hunks,
}: ParsedDiff) => {
  const isAdded = oldFileName === "/dev/null"
  const isDeleted = newFileName === "/dev/null"
  const isModified = !isAdded && !isDeleted

  const filePathWithPrefix = isDeleted ? oldFileName : newFileName

  const match = filePathWithPrefix.match(
    /^(?:[ab]\/)(?<path>(?:[^/]+\/)*(?<name>[^/]+\.(?<ext>[^.]+)))$/,
  )

  const filePath = match?.groups?.path ?? ""
  const fileName = match?.groups?.name ?? ""
  const fileExt = match?.groups?.ext ?? ""

  const langId = isModified ? (fileExt ? `diff-${fileExt}` : "diff") : fileExt

  const hunkList = hunks.map(({ newStart, oldStart, lines }, index, array) => {
    // ファイルを追加した場合や削除した場合は全行に `+` や `-` が付いているので削除する
    const code = isModified
      ? lines.join("\n")
      : lines.join("\n").replace(/^[+-]/gm, "")

    const isFirst = index === 0
    const isLast = index === array.length - 1

    return {
      code,
      langId,
      filePath,
      fileName,
      newStart,
      oldStart,
      isFirst,
      isLast,
    }
  })

  const view = {
    // 変数
    isAdded,
    isDeleted,
    isModified,

    // リスト
    hunkList,

    // ラムダ
    trimWhitespace:
      () => (text: string, render: (template: string) => string) => {
        const rendered = render(text)
        return rendered.trim()
      },
    collapseWhitespace:
      () => (text: string, render: (template: string) => string) => {
        const rendered = render(text)
        return rendered.replace(/\s+/g, " ")
      },
  }

  return mustache.render(template, view)
}
