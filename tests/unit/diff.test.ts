import type { StructuredPatch } from "diff"
import { describe, expect, it } from "vitest"

describe("getFilePath", () => {
  it("newFileName からファイルパスを抽出する", () => {
    const patch: StructuredPatch = {
      oldFileName: "a/src/components/Button.tsx",
      newFileName: "b/src/components/Button.tsx",
      oldHeader: "",
      newHeader: "",
      hunks: [],
    }

    const result = getFilePath(patch)
    expect(result).toBe("src/components/Button.tsx")
  })

  it("newFileName が /dev/null の場合は oldFileName からファイルパスを抽出する", () => {
    const patch: StructuredPatch = {
      oldFileName: "a/src/deleted.js",
      newFileName: "/dev/null",
      oldHeader: "",
      newHeader: "",
      hunks: [],
    }

    const result = getFilePath(patch)
    expect(result).toBe("src/deleted.js")
  })

  it("oldFileName が /dev/null の場合は newFileName からファイルパスを抽出する", () => {
    const patch: StructuredPatch = {
      oldFileName: "/dev/null",
      newFileName: "b/src/added.js",
      oldHeader: "",
      newHeader: "",
      hunks: [],
    }

    const result = getFilePath(patch)
    expect(result).toBe("src/added.js")
  })

  it("両方のファイルが /dev/null の場合は空文字列を返す", () => {
    const patch: StructuredPatch = {
      oldFileName: "/dev/null",
      newFileName: "/dev/null",
      oldHeader: "",
      newHeader: "",
      hunks: [],
    }

    const result = getFilePath(patch)
    expect(result).toBe("")
  })
})
