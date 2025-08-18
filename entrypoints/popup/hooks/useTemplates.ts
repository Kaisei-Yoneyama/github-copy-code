import { useCallback, useEffect, useState } from "react"

export const useTemplates = () => {
  const templatesService = getTemplatesService()
  const settingsService = getSettingsService()
  const [templates, setTemplates] = useState<Template[]>([])
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [allTemplates, defaultTemplateId] = await Promise.all([
        templatesService.getAllTemplates(),
        settingsService.getDefaultTemplateId(),
      ])
      setTemplates(allTemplates)
      setDefaultTemplateId(defaultTemplateId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const createTemplate = useCallback(
    async (
      template: Pick<Template, "name" | "content">,
      isDefault?: boolean,
    ) => {
      try {
        const newTemplate = await templatesService.createTemplate(
          template.name,
          template.content,
          isDefault,
        )
        await loadTemplates()
        return newTemplate
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create template",
        )
      }
    },
    [],
  )

  const updateTemplate = useCallback(
    async (
      id: string,
      template: Pick<Template, "name" | "content">,
      isDefault?: boolean,
    ) => {
      try {
        const updatedTemplate = await templatesService.updateTemplate(
          id,
          template.name,
          template.content,
          isDefault,
        )
        await loadTemplates()
        return updatedTemplate
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update template",
        )
      }
    },
    [],
  )

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await templatesService.deleteTemplate(id)
      await loadTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template")
    }
  }, [])

  const setDefaultTemplate = useCallback(async (id: string) => {
    try {
      await templatesService.setDefaultTemplate(id)
      await loadTemplates()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set default template",
      )
    }
  }, [])

  return {
    templates,
    defaultTemplateId,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    reloadTemplates: loadTemplates,
  }
}
