import { PlusIcon } from "@primer/octicons-react"
import {
  BaseStyles,
  Button,
  ButtonGroup,
  PageHeader,
  PageLayout,
  ThemeProvider,
} from "@primer/react"
import { Banner } from "@primer/react/experimental"
import { useState } from "react"
import { ExportButton } from "./components/ExportButton"
import { ImportButton } from "./components/ImportButton"
import { TemplateFormDialog } from "./components/TemplateFormDialog"
import { TemplateList } from "./components/TemplateList"
import { useTemplates } from "./hooks/useTemplates"

const App = () => {
  const {
    templates,
    defaultTemplateId,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useTemplates()

  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [alert, setAlert] = useState<{
    variant: "success" | "critical"
    message: string
  } | null>(null)

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowDialog(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowDialog(true)
  }

  const handleSave = async (
    data: Pick<Template, "name" | "content">,
    isDefault: boolean,
  ) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data, isDefault)
    } else {
      await createTemplate(data, isDefault)
    }
    setShowDialog(false)
  }

  const handleClose = () => {
    setShowDialog(false)
    setEditingTemplate(null)
  }

  const handleImport = async (importedTemplates: Template[]) => {
    for (const template of importedTemplates) {
      await createTemplate(template)
    }
  }

  const handleAlertSuccess = (message: string) => {
    setAlert({ variant: "success", message })
  }

  const handleAlertError = (message: string) => {
    setAlert({ variant: "critical", message })
  }

  return (
    <ThemeProvider colorMode="auto" dayScheme="light" nightScheme="dark">
      <BaseStyles>
        <PageLayout>
          <PageLayout.Header>
            <PageHeader>
              <PageHeader.TitleArea>
                <PageHeader.Title>GitHub Copy Code</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Actions>
                <ButtonGroup>
                  <ExportButton
                    templates={templates}
                    onSuccess={handleAlertSuccess}
                    onError={handleAlertError}
                  />
                  <ImportButton
                    onImport={handleImport}
                    onSuccess={handleAlertSuccess}
                    onError={handleAlertError}
                  />
                </ButtonGroup>
                <Button
                  variant="primary"
                  leadingVisual={PlusIcon}
                  onClick={handleCreate}
                >
                  New template
                </Button>
              </PageHeader.Actions>
            </PageHeader>
          </PageLayout.Header>
          <PageLayout.Content>
            {alert && (
              <Banner
                title={alert.variant === "success" ? "Success" : "Error"}
                variant={alert.variant}
                description={alert.message}
                onDismiss={() => setAlert(null)}
                style={{ marginBottom: 16 }}
              />
            )}
            <TemplateList
              templates={templates}
              defaultTemplateId={defaultTemplateId}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={deleteTemplate}
              onSetDefault={setDefaultTemplate}
            />
          </PageLayout.Content>
        </PageLayout>
        {showDialog && (
          <TemplateFormDialog
            template={editingTemplate}
            defaultTemplateId={defaultTemplateId}
            onSave={handleSave}
            onClose={handleClose}
          />
        )}
      </BaseStyles>
    </ThemeProvider>
  )
}

export default App
