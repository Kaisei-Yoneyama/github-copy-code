import type { StructuredPatch } from "diff"

export const getFilePath = ({ newFileName, oldFileName }: StructuredPatch) => {
  const newFilePath = newFileName === "/dev/null" ? undefined : newFileName
  const oldFilePath = oldFileName === "/dev/null" ? undefined : oldFileName

  const filePathWithPrefix = newFilePath ?? oldFilePath ?? ""
  const filePath = filePathWithPrefix.replace(/^[ab]\//, "")

  return filePath
}
