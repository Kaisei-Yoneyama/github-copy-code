import { type ComponentProps, useRef, useState } from "react"
import Alert from "react-bootstrap/Alert"
import Button from "react-bootstrap/Button"
import ButtonGroup from "react-bootstrap/ButtonGroup"

interface TemplateTransferProps {
  templates: Template[]
  onImport: (templates: Template[]) => Promise<void>
}

export const TemplateTransfer = ({
  templates,
  onImport,
}: TemplateTransferProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [alert, setAlert] = useState<{
    variant: ComponentProps<typeof Alert>["variant"]
    message: string
  } | null>(null)

  const handleExport = async () => {
    try {
      const data = JSON.stringify(templates, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const downloadId = await browser.downloads.download({ saveAs: true, url })
      const handleChanged = (delta: Browser.downloads.DownloadDelta) => {
        if (delta.id === downloadId && delta.state?.current === "complete") {
          browser.downloads.onChanged.removeListener(handleChanged)
          setAlert({
            variant: "success",
            message: "Templates exported successfully",
          })
        }
      }
      browser.downloads.onChanged.addListener(handleChanged)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export templates:", err)
      setAlert({ variant: "danger", message: "Failed to export templates" })
    }
  }

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }) as const satisfies Template,
      )
      await onImport(importedTemplates)
      setAlert({
        variant: "success",
        message: `Successfully imported ${importedTemplates.length} template(s)`,
      })
    } catch (err) {
      console.error("Failed to import templates:", err)
      setAlert({ variant: "danger", message: "Failed to import templates" })
    } finally {
      event.target.value = ""
    }
  }

  return (
    <>
      {alert && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert(null)}
          dismissible
          className="mb-3"
        >
          {alert.message}
        </Alert>
      )}
      <ButtonGroup>
        <Button variant="secondary" onClick={handleExport}>
          Export Templates
        </Button>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Import Templates
        </Button>
      </ButtonGroup>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="d-none"
      />
    </>
  )
}
