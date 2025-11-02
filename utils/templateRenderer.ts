import Handlebars from "handlebars"

export interface TemplateRenderer {
  /**
   * テンプレートをレンダリングする
   * @param templateSource テンプレートコード
   * @param context テンプレートコンテキスト
   * @returns レンダリング結果
   */
  render(templateSource: string, context: Record<string, unknown>): string

  /**
   * テンプレートの構文を検証する
   * @param templateSource テンプレートコード
   */
  validate(templateSource: string): void
}

export const createTemplateRenderer = (): TemplateRenderer => {
  Handlebars.registerHelper(
    "trimWhitespace",
    function (this: unknown, options) {
      return options.fn(this).trim()
    },
  )
  Handlebars.registerHelper(
    "collapseWhitespace",
    function (this: unknown, options) {
      return options.fn(this).replace(/\s+/g, " ")
    },
  )

  const DUMMY_CONTEXT = {
    isAdded: false,
    isDeleted: false,
    isModified: true,
    hunkList: [
      {
        code: " line2\n line3\n line4\n-line5\n line6\n line7\n line8",
        langId: "diff-txt",
        filePath: "text.txt",
        fileName: "text.txt",
        newStart: 2,
        oldStart: 2,
        isFirst: true,
        isLast: false,
      },
      {
        code: " line12\n line13\n line14\n-line15",
        langId: "diff-txt",
        filePath: "text.txt",
        fileName: "text.txt",
        newStart: 11,
        oldStart: 12,
        isFirst: false,
        isLast: true,
      },
    ],
  }

  return {
    render(templateSource: string, context: Record<string, unknown>): string {
      const template = Handlebars.compile(templateSource)
      return template(context)
    },

    validate(templateSource: string): void {
      const template = Handlebars.compile(templateSource)
      template(DUMMY_CONTEXT) // 多くの構文エラーは実行時に発生するため、ダミーコンテキストで試してみる
    },
  }
}

let globalRenderer: TemplateRenderer | null = null

export const getTemplateRenderer = (): TemplateRenderer => {
  if (!globalRenderer) {
    globalRenderer = createTemplateRenderer()
  }

  return globalRenderer
}
