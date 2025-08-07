import { Dialog, FormControl, Textarea, TextInput } from "@primer/react"
import { Banner } from "@primer/react/experimental"
import mustache from "mustache"
import { FormEvent, useEffect, useState } from "react"

interface TemplateFormDialogProps {
  template: Template | null
  onSave: (data: Pick<Template, "name" | "content">) => Promise<void>
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement>
}

interface Errors {
  name?: string
  content?: string
  general?: string
}

export const TemplateFormDialog = ({
  template,
  onSave,
  onClose,
  returnFocusRef,
}: TemplateFormDialogProps) => {
  const formId = "template-form"
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    setName(template?.name || "")
    setContent(template?.content || "")
    setValidated(false)
    setErrors({})
  }, [template])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidated(true)

    const newErrors: Errors = {}

    if (!name.trim()) {
      newErrors.name = "Template name is required"
    }
    if (!content.trim()) {
      newErrors.content = "Template content is required"
    }

    try {
      mustache.parse(content)
    } catch (err) {
      newErrors.content =
        err instanceof Error ? err.message : "Invalid Mustache syntax"
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave({
        name: name.trim(),
        content: content.trim(),
      })
      onClose()
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Failed to save template",
      })
    }
  }

  const handleClose = () => {
    setValidated(false)
    setName("")
    setContent("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog
      title={template ? "Edit template" : "Create template"}
      onClose={handleClose}
      width="xlarge"
      height="large"
      returnFocusRef={returnFocusRef}
      footerButtons={[
        {
          buttonType: "default",
          content: "Cancel",
          onClick: handleClose,
        },
        {
          buttonType: "primary",
          content: template ? "Update template" : "Create template",
          type: "submit",
          form: formId,
        },
      ]}
    >
      {errors.general && (
        <Banner
          title="Error"
          variant="critical"
          description={errors.general}
          style={{ marginBottom: 8 }}
        />
      )}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 8 }}>
          <FormControl required>
            <FormControl.Label>Template name</FormControl.Label>
            <TextInput
              type="text"
              name="name"
              placeholder="Sample template"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              validationStatus={validated && errors.name ? "error" : undefined}
              block
            />
            {validated && errors.name && (
              <FormControl.Validation variant="error">
                {errors.name}
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FormControl required>
            <FormControl.Label>Template content</FormControl.Label>
            <Textarea
              name="content"
              rows={10}
              placeholder="{{#hunkList}}&#13;{{#collapseWhitespace}}```{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}&#13;{{{code}}}&#13;```&#13;{{/hunkList}}"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              validationStatus={
                validated && errors.content ? "error" : undefined
              }
              block
              resize="vertical"
              style={{ fontFamily: "monospace" }}
            />
            {validated && errors.content && (
              <FormControl.Validation variant="error">
                {errors.content}
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
      </form>
    </Dialog>
  )
}
