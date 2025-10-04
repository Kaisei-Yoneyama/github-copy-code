import { renderToMarkup } from "@/entrypoints/github.content/markup"
import { structuredPatch } from "diff"
import { beforeEach, describe, expect, it, vi } from "vitest"

const TEST_TEMPLATE = `
<!-- Test template -->
{{#hunkList}}
{{#collapseWhitespace}}\`\`\`{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
{{{code}}}
\`\`\`
{{/hunkList}}
`

// templatesService のモック
vi.mock("@/utils/templatesService", () => ({
  getTemplatesService: vi.fn(() => ({
    getDefaultTemplate: vi.fn().mockResolvedValue({
      id: "test-template",
      name: "Test Template",
      source: TEST_TEMPLATE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  })),
}))

describe("renderToMarkup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("変更されたファイルを diff 形式でレンダリングする", async () => {
    const fileName = "hello.scala"
    const oldContent = `object hello {
  def main(args: Array[String]) = {
    println("Hello, World!")
  }
}
`
    const newContent = `@main def hello() = println("Hello, World!")
`

    const patch = structuredPatch(
      `a/${fileName}`,
      `b/${fileName}`,
      oldContent,
      newContent,
      "",
      "",
    )

    const result = await renderToMarkup(patch)

    const expected = `
<!-- Test template -->
\`\`\`diff-scala filePath=hello.scala newStart=1 oldStart=1
-object hello {
-  def main(args: Array[String]) = {
-    println("Hello, World!")
-  }
-}
+@main def hello() = println("Hello, World!")
\`\`\`
`

    expect(result).toBe(expected)
  })

  it("追加されたファイルを diff マーカーなしでレンダリングする", async () => {
    const fileName = "hello.scala"
    const oldContent = ""
    const newContent = `object hello {
  def main(args: Array[String]) = {
    println("Hello, World!")
  }
}
`

    const patch = structuredPatch(
      "/dev/null",
      `b/${fileName}`,
      oldContent,
      newContent,
      "",
      "",
    )

    const markup = await renderToMarkup(patch)

    const expected = `
<!-- Test template -->
\`\`\`scala filePath=hello.scala newStart=1 oldStart=1
object hello {
  def main(args: Array[String]) = {
    println("Hello, World!")
  }
}
\`\`\`
`

    expect(markup).toBe(expected)
  })

  it("削除されたファイルを diff マーカーなしでレンダリングする", async () => {
    const fileName = "hello.scala"
    const oldContent = `@main def hello() = println("Hello, World!")
`
    const newContent = ""

    const patch = structuredPatch(
      `a/${fileName}`,
      "/dev/null",
      oldContent,
      newContent,
      "",
      "",
    )

    const markup = await renderToMarkup(patch)

    const expected = `
<!-- Test template -->
\`\`\`scala filePath=hello.scala newStart=1 oldStart=1
@main def hello() = println("Hello, World!")
\`\`\`
`

    expect(markup).toBe(expected)
  })

  it("複数のハンクに対応する", async () => {
    const fileName = "text.txt"
    const oldContent = `line1
line2
line3
line4
line5
line6
line7
line8
line9
line10
line11
line12
line13
line14
line15
`
    const newContent = `line1
line2
line3
line4
line6
line7
line8
line9
line10
line11
line12
line13
line14
`

    const patch = structuredPatch(
      `a/${fileName}`,
      `b/${fileName}`,
      oldContent,
      newContent,
      "",
      "",
      { context: 3 },
    )

    const markup = await renderToMarkup(patch)

    const expected = `
<!-- Test template -->
\`\`\`diff-txt filePath=text.txt newStart=2 oldStart=2
 line2
 line3
 line4
-line5
 line6
 line7
 line8
\`\`\`
\`\`\`diff-txt newStart=11 oldStart=12
 line12
 line13
 line14
-line15
\`\`\`
`

    expect(markup).toBe(expected)
  })
})
