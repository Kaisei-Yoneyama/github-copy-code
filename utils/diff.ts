import type { ParsedDiff } from "diff"

export const getFilePath = ({ newFileName, oldFileName }: ParsedDiff) => {
  if (newFileName === "dev/null") newFileName = undefined
  if (oldFileName === "dev/null") oldFileName = undefined

  const filePathWithPrefix = newFileName ?? oldFileName ?? ""
  const filePath = filePathWithPrefix.replace(/^[ab]\//, "")

  return filePath
}
