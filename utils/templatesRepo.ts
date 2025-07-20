import { defineProxyService } from "@webext-core/proxy-service"
import { IDBPDatabase } from "idb"

export interface Template {
  id: string
  name: string
  content: string
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

// FIXME: `setDefault()` と `getDefault()` はリポジトリに実装したくないが、実装の簡略化のために許容している

export interface TemplatesRepo {
  /**
   * 指定したテンプレートを保存する
   * @param template テンプレート
   */
  createOrUpdate(template: Template): Promise<void>

  /**
   * 指定した ID のテンプレートを削除する
   * @param template テンプレート
   */
  delete(templateId: Template["id"]): Promise<void>

  /**
   * 指定した ID のテンプレートをデフォルトに設定する
   * @param template テンプレート
   */
  setDefault(templateId: Template["id"]): Promise<void>

  /**
   * デフォルトのテンプレートを取得する
   */
  getDefault(): Promise<Template | null>

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

type TemplateDB = Omit<Template, "isDefault"> & {
  /**
   * `isDefault` にインデックスを張りたいが、論理値はキーとして扱えないため数値を使用する
   * @see {@link https://www.w3.org/TR/IndexedDB/#key-construct|Indexed Database API 3.0}
   */
  isDefault: 0 | 1
}
const toDB = (template: Template): TemplateDB => ({
  ...template,
  isDefault: template.isDefault ? 1 : 0,
})
const fromDB = (template: TemplateDB): Template => ({
  ...template,
  isDefault: !!template.isDefault,
})

const createTemplatesRepo = (db: Promise<IDBPDatabase>): TemplatesRepo => {
  const storeName = "templates"
  const indexName = "isDefault"

  return {
    async createOrUpdate(template: Template): Promise<void> {
      const database = await db
      await database.put(storeName, toDB(template))
    },

    async delete(templateId: Template["id"]): Promise<void> {
      const database = await db
      await database.delete(storeName, templateId)
    },

    async setDefault(templateId: Template["id"]): Promise<void> {
      const database = await db
      const transaction = database.transaction(storeName, "readwrite")

      // デフォルトは通常 1 つのはずだが、IndexedDB の不正な変更も考慮して全て更新する
      const existingDefaults = await transaction.store
        .index(indexName)
        .getAll(1)
      await Promise.all(
        existingDefaults
          .filter((template) => template.id !== templateId)
          .map((template) =>
            transaction.store.put(
              toDB({
                ...template,
                isDefault: false,
                updatedAt: Date.now(),
              }),
            ),
          ),
      )

      const template = await transaction.store.get(templateId)
      if (template) {
        await transaction.store.put(
          toDB({
            ...template,
            isDefault: true,
            updatedAt: Date.now(),
          }),
        )
      }

      await transaction.done
    },

    async getDefault(): Promise<Template | null> {
      const database = await db
      const record = await database.getFromIndex(storeName, indexName, 1)
      return record ? fromDB(record) : null
    },

    async getOne(templateId: Template["id"]): Promise<Template | null> {
      const database = await db
      const record = await database.get(storeName, templateId)
      return record ? fromDB(record) : null
    },

    // 大量のテンプレートが作られることは考慮しない
    async getAll(): Promise<Template[]> {
      const database = await db
      const records = await database.getAll(storeName)
      return records.map(fromDB)
    },
  }
}

export const [registerTemplatesRepo, getTemplatesRepo] = defineProxyService(
  "templatesRepo",
  createTemplatesRepo,
)
