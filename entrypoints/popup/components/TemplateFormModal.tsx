import mustache from "mustache"
import { FormEvent, useEffect, useState } from "react"
import Alert from "react-bootstrap/Alert"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Modal from "react-bootstrap/Modal"

interface TemplateFormModalProps {
  show: boolean
  template: Template | null
  onSave: (data: Pick<Template, "name" | "content">) => Promise<void>
  onClose: () => void
}

interface Errors {
  name?: string
  content?: string
  general?: string
}

export const TemplateFormModal = ({
  show,
  template,
  onSave,
  onClose,
}: TemplateFormModalProps) => {
  const formId = "template-form"
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (show) {
      setName(template?.name || "")
      setContent(template?.content || "")
      setValidated(false)
      setErrors({})
    }
  }, [show, template])

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

  return (
    <Modal
      show={show}
      onHide={() => {
        setValidated(false)
        setName("")
        setContent("")
        setErrors({})
        onClose()
      }}
      fullscreen
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {template ? "Edit template" : "Create template"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}
        <Form id={formId} onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="templateName">
            <Form.Label>Template name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Sample template"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={validated && !!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="templateContent">
            <Form.Label>Template content</Form.Label>
            <Form.Control
              as="textarea"
              name="content"
              rows={10}
              placeholder="{{#hunkList}}&#13;{{#collapseWhitespace}}```{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}&#13;{{{code}}}&#13;```&#13;{{/hunkList}}"
              style={{ fontFamily: "monospace" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              isInvalid={validated && !!errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form={formId}>
          {template ? "Update template" : "Create template"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
