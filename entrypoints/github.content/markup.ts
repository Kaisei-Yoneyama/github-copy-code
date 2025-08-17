import type { StructuredPatch } from "diff"
import mustache from "mustache"

const SAMPLE_TEMPLATE = `
<!-- Sample template -->
{{#hunkList}}
{{#collapseWhitespace}}\`\`\`{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
{{{code}}}
\`\`\`
{{/hunkList}}
`

const getTemplate = async (): Promise<string> => {
  try {
    const templatesService = getTemplatesService()
    const defaultTemplate = await templatesService.getDefaultTemplate()

    if (defaultTemplate) {
      return defaultTemplate.content
    }
  } catch (error) {
    console.error("Failed to get default template:", error)
  }

  return SAMPLE_TEMPLATE
}

export const renderToMarkup = async ({
  newFileName = "",
  oldFileName = "",
  hunks,
}: StructuredPatch) => {
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

  const template = await getTemplate()
  return mustache.render(template, view)
}
