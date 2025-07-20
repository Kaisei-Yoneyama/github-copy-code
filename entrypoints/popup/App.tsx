import { useState } from "react"
import Container from "react-bootstrap/Container"
import Navbar from "react-bootstrap/Navbar"
import { TemplateFormModal } from "./components/TemplateFormModal"
import { TemplateList } from "./components/TemplateList"
import { TemplateTransfer } from "./components/TemplateTransfer"
import { useTemplates } from "./hooks/useTemplates"

const App = () => {
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useTemplates()

  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowModal(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowModal(true)
  }

  const handleSave = async (data: Pick<Template, "name" | "content">) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data)
    } else {
      await createTemplate(data)
    }
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingTemplate(null)
  }

  const handleImport = async (importedTemplates: Template[]) => {
    for (const template of importedTemplates) {
      await createTemplate(template)
    }
  }

  return (
    <>
      <Navbar className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand>GitHub Copy Code</Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid className="py-3">
        <TemplateList
          templates={templates}
          loading={loading}
          error={error}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={deleteTemplate}
          onSetDefault={setDefaultTemplate}
        />
        <hr className="my-3" />
        <TemplateTransfer templates={templates} onImport={handleImport} />
      </Container>
      <TemplateFormModal
        show={showModal}
        template={editingTemplate}
        onSave={handleSave}
        onClose={handleClose}
      />
    </>
  )
}

export default App
