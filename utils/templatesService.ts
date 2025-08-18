import { defineProxyService } from "@webext-core/proxy-service"

export interface TemplatesService {
  /**
   * 全てのテンプレートを取得する
   */
  getAllTemplates(): Promise<Template[]>

  /**
   * デフォルトのテンプレートを取得する
   */
  getDefaultTemplate(): Promise<Template | null>

  /**
   * テンプレートを作成する
   * @param name テンプレートの名前
   * @param content テンプレートの内容
   * @param isDefault デフォルトとして設定するか
   */
  createTemplate(
    name: string,
    content: string,
    isDefault?: boolean,
  ): Promise<Template>

  /**
   * テンプレートを更新する
   * @param id テンプレート ID
   * @param name テンプレートの名前
   * @param content テンプレートの内容
   * @param isDefault デフォルトとして設定するか
   */
  updateTemplate(
    id: string,
    name: string,
    content: string,
    isDefault?: boolean,
  ): Promise<Template>

  /**
   * テンプレートを削除する
   * @param id テンプレート ID
   */
  deleteTemplate(id: string): Promise<void>

  /**
   * デフォルトのテンプレートを設定する
   * @param id テンプレート ID
   */
  setDefaultTemplate(id: string): Promise<void>
}

const createTemplatesService = (
  templatesRepo: TemplatesRepo,
  settingsRepo: SettingsRepo,
): TemplatesService => {
  const SETTINGS_ID = "default"

  return {
    async getAllTemplates(): Promise<Template[]> {
      return templatesRepo.getAll()
    },

    async getDefaultTemplate(): Promise<Template | null> {
      const settings = await settingsRepo.getOne(SETTINGS_ID)
      const defaultTemplateId = settings?.defaultTemplateId

      if (!defaultTemplateId) {
        return null
      }

      return templatesRepo.getOne(defaultTemplateId)
    },

    async createTemplate(
      name: string,
      content: string,
      isDefault?: boolean,
    ): Promise<Template> {
      const newTemplate = {
        id: crypto.randomUUID(),
        name,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as const satisfies Template
      await templatesRepo.createOrUpdate(newTemplate)

      if (isDefault) {
        const existingSettings = await settingsRepo.getOne(SETTINGS_ID)
        const settings = existingSettings
          ? ({
              ...existingSettings,
              defaultTemplateId: newTemplate.id,
              updatedAt: Date.now(),
            } as const satisfies Settings)
          : ({
              id: SETTINGS_ID,
              defaultTemplateId: newTemplate.id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } as const satisfies Settings)
        await settingsRepo.createOrUpdate(settings)
      }

      return newTemplate
    },

    async updateTemplate(
      id: string,
      name: string,
      content: string,
      isDefault?: boolean,
    ): Promise<Template> {
      const existingTemplate = await templatesRepo.getOne(id)

      if (!existingTemplate) {
        throw new Error("Template not found")
      }

      const updatedTemplate = {
        ...existingTemplate,
        name,
        content,
        updatedAt: Date.now(),
      } as const satisfies Template
      await templatesRepo.createOrUpdate(updatedTemplate)

      if (isDefault !== undefined) {
        const existingSettings = await settingsRepo.getOne(SETTINGS_ID)
        const settings = existingSettings
          ? ({
              ...existingSettings,
              defaultTemplateId: isDefault ? id : null,
              updatedAt: Date.now(),
            } as const satisfies Settings)
          : ({
              id: SETTINGS_ID,
              defaultTemplateId: isDefault ? id : null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } as const satisfies Settings)
        await settingsRepo.createOrUpdate(settings)
      }

      return updatedTemplate
    },

    async deleteTemplate(id: string): Promise<void> {
      const settings = await settingsRepo.getOne(SETTINGS_ID)

      if (settings?.defaultTemplateId === id) {
        await settingsRepo.createOrUpdate({
          ...settings,
          defaultTemplateId: null,
          updatedAt: Date.now(),
        })
      }

      await templatesRepo.delete(id)
    },

    async setDefaultTemplate(id: string): Promise<void> {
      const template = await templatesRepo.getOne(id)

      if (!template) {
        throw new Error("Template not found")
      }

      const existingSettings = await settingsRepo.getOne(SETTINGS_ID)
      const settings = existingSettings
        ? ({
            ...existingSettings,
            defaultTemplateId: id,
            updatedAt: Date.now(),
          } as const satisfies Settings)
        : ({
            id: SETTINGS_ID,
            defaultTemplateId: id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } as const satisfies Settings)
      await settingsRepo.createOrUpdate(settings)
    },
  }
}

export const [registerTemplatesService, getTemplatesService] =
  defineProxyService("templatesService", createTemplatesService)
