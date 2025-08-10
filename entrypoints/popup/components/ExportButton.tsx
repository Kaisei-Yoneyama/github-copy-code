import { DownloadIcon } from "@primer/octicons-react"
import { Button } from "@primer/react"

interface ExportButtonProps {
  templates: Template[]
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export const ExportButton = ({
  templates,
  onSuccess,
  onError,
}: ExportButtonProps) => {
  const handleExport = async () => {
    try {
      const data = JSON.stringify(templates, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const downloadId = await browser.downloads.download({ saveAs: true, url })

      const handleChanged = (delta: Browser.downloads.DownloadDelta) => {
        if (delta.id === downloadId && delta.state?.current === "complete") {
          browser.downloads.onChanged.removeListener(handleChanged)
          onSuccess?.("Templates exported successfully")
        }
      }

      browser.downloads.onChanged.addListener(handleChanged)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export templates:", err)
      onError?.("Failed to export templates")
    }
  }

  return (
    <Button leadingVisual={DownloadIcon} onClick={handleExport}>
      Export
    </Button>
  )
}
