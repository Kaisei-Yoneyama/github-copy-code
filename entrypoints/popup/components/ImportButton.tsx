import { UploadIcon } from "@primer/octicons-react"
import { Button } from "@primer/react"
import { useRef } from "react"

interface ImportButtonProps {
  onImport: (templates: Template[]) => Promise<void>
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export const ImportButton = ({
  onImport,
  onSuccess,
  onError,
}: ImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0)
    if (!file) return

    try {
      const data = JSON.parse(await file.text())

      // TODO: バリデーションを改善する
      if (
        !Array.isArray(data) ||
        !data.every(
          (template) =>
            typeof template?.name === "string" &&
            typeof template?.content === "string",
        )
      ) {
        throw new Error("Invalid format")
      }

      const importedTemplates = data.map(
        (template) =>
          ({
            id: crypto.randomUUID(),
            name: template.name,
            content: template.content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }) as const satisfies Template,
      )

      await onImport(importedTemplates)
      onSuccess?.(
        `Successfully imported ${importedTemplates.length} template(s)`,
      )
    } catch (err) {
      console.error("Failed to import templates:", err)
      onError?.("Failed to import templates")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <>
      <Button
        leadingVisual={UploadIcon}
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
    </>
  )
}
