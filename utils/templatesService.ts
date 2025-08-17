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
   */
  createTemplate(name: string, content: string): Promise<Template>

  /**
   * テンプレートを更新する
   * @param id テンプレート ID
   * @param name テンプレートの名前
   * @param content テンプレートの内容
   */
  updateTemplate(id: string, name: string, content: string): Promise<Template>

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
): TemplatesService => {
  return {
    async getAllTemplates(): Promise<Template[]> {
      return templatesRepo.getAll()
    },

    async getDefaultTemplate(): Promise<Template | null> {
      return templatesRepo.getDefault()
    },

    async createTemplate(name: string, content: string): Promise<Template> {
      const newTemplate = {
        id: crypto.randomUUID(),
        name,
        content,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as const satisfies Template
      await templatesRepo.createOrUpdate(newTemplate)
      return newTemplate
    },

    async updateTemplate(
      id: string,
      name: string,
      content: string,
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
      return updatedTemplate
    },

    async deleteTemplate(id: string): Promise<void> {
      await templatesRepo.delete(id)
    },

    async setDefaultTemplate(id: string): Promise<void> {
      await templatesRepo.setDefault(id)
    },
  }
}

export const [registerTemplatesService, getTemplatesService] =
  defineProxyService("templatesService", createTemplatesService)
