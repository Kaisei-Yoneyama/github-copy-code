import {
  Checkbox,
  Dialog,
  FormControl,
  Textarea,
  TextInput,
} from "@primer/react"
import { Banner } from "@primer/react/experimental"
import { FormEvent, useEffect, useState } from "react"

interface TemplateFormDialogProps {
  template: Template | null
  defaultTemplateId: string | null
  onSave: (
    data: Pick<Template, "name" | "source">,
    isDefault: boolean,
  ) => Promise<void>
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement>
}

interface Errors {
  name?: string
  source?: string
  general?: string
}

export const TemplateFormDialog = ({
  template,
  defaultTemplateId,
  onSave,
  onClose,
  returnFocusRef,
}: TemplateFormDialogProps) => {
  const formId = "template-form"
  const [name, setName] = useState("")
  const [source, setSource] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    setName(template?.name || "")
    setSource(template?.source || "")
    setIsDefault(template?.id === defaultTemplateId)
    setValidated(false)
    setErrors({})
  }, [template, defaultTemplateId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidated(true)

    const newErrors: Errors = {}

    if (!name.trim()) {
      newErrors.name = "Template name is required"
    }
    if (!source.trim()) {
      newErrors.source = "Template source is required"
    }

    try {
      const response = await retry(() =>
        sendMessage(
          "validate",
          { templateSource: source },
          ensureSandboxContentWindow(),
        ),
      )

      if (!response.success) {
        newErrors.source = response.error
      }
    } catch (err) {
      newErrors.source =
        err instanceof Error ? err.message : "Invalid Handlebars syntax"
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave(
        {
          name: name.trim(),
          source: source.trim(),
        },
        isDefault,
      )
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
    setSource("")
    setIsDefault(false)
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
                <span style={{ whiteSpace: "pre-wrap" }}>{errors.name}</span>
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FormControl required>
            <FormControl.Label>Template source</FormControl.Label>
            <Textarea
              name="source"
              rows={10}
              placeholder="{{#each hunkList}}&#10;```{{langId}} {{#if @first}}filePath={{{filePath}}} {{/if}}newStart={{newStart}} oldStart={{oldStart}}&#10;{{{code}}}&#10;```&#10;{{/each}}"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              validationStatus={
                validated && errors.source ? "error" : undefined
              }
              block
              resize="vertical"
              style={{ fontFamily: "monospace" }}
            />
            {validated && errors.source && (
              <FormControl.Validation variant="error">
                <span style={{ whiteSpace: "pre-wrap" }}>{errors.source}</span>
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FormControl>
            <Checkbox
              name="default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <FormControl.Label>Set as default template</FormControl.Label>
          </FormControl>
        </div>
      </form>
    </Dialog>
  )
}
