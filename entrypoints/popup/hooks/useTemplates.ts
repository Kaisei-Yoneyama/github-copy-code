import { useCallback, useEffect, useState } from "react"

export const useTemplates = () => {
  const templatesService = getTemplatesService()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allTemplates = await templatesService.getAllTemplates()
      setTemplates(allTemplates)
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
    async (template: Pick<Template, "name" | "content">) => {
      try {
        const newTemplate = await templatesService.createTemplate(
          template.name,
          template.content,
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
    async (id: string, template: Pick<Template, "name" | "content">) => {
      try {
        const updatedTemplate = await templatesService.updateTemplate(
          id,
          template.name,
          template.content,
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
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    reloadTemplates: loadTemplates,
  }
}
