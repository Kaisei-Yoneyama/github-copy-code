import { useCallback, useEffect, useState } from "react"

export const useTemplates = () => {
  const templatesRepo = getTemplatesRepo()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allTemplates = await templatesRepo.getAll()
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
        const newTemplate = {
          ...template,
          id: crypto.randomUUID(),
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as const satisfies Template
        await templatesRepo.createOrUpdate(newTemplate)
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
        const existing = await templatesRepo.getOne(id)

        if (!existing) {
          throw new Error("Template not found")
        }

        const updatedTemplate = {
          ...existing,
          ...template,
          updatedAt: Date.now(),
        } as const satisfies Template
        await templatesRepo.createOrUpdate(updatedTemplate)
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
      await templatesRepo.delete(id)
      await loadTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template")
    }
  }, [])

  const setDefaultTemplate = useCallback(async (id: string) => {
    try {
      await templatesRepo.setDefault(id)
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
