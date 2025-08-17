import { defineProxyService } from "@webext-core/proxy-service"
import { IDBPDatabase } from "idb"

export interface Template {
  id: string
  name: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface TemplatesRepo {
  /**
   * 指定したテンプレートを保存する
   * @param template テンプレート
   */
  createOrUpdate(template: Template): Promise<void>

  /**
   * 指定した ID のテンプレートを削除する
   * @param templateId テンプレート ID
   */
  delete(templateId: Template["id"]): Promise<void>

  /**
   * 指定した ID のテンプレートを取得する
   * @param id テンプレート ID
   */
  getOne(id: Template["id"]): Promise<Template | null>

  /**
   * 全てのテンプレートを取得する
   */
  getAll(): Promise<Template[]>
}

const createTemplatesRepo = (db: Promise<IDBPDatabase>): TemplatesRepo => {
  const storeName = "templates"

  return {
    async createOrUpdate(template: Template): Promise<void> {
      const database = await db
      await database.put(storeName, template)
    },

    async delete(templateId: Template["id"]): Promise<void> {
      const database = await db
      await database.delete(storeName, templateId)
    },

    async getOne(templateId: Template["id"]): Promise<Template | null> {
      const database = await db
      const record = await database.get(storeName, templateId)
      return record
    },

    // 大量のテンプレートが作られることは考慮しない
    async getAll(): Promise<Template[]> {
      const database = await db
      const records = await database.getAll(storeName)
      return records
    },
  }
}

export const [registerTemplatesRepo, getTemplatesRepo] = defineProxyService(
  "templatesRepo",
  createTemplatesRepo,
)
