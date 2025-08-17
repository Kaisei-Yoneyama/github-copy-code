import { defineProxyService } from "@webext-core/proxy-service"
import { IDBPDatabase } from "idb"

export interface Settings {
  id: string
  defaultTemplateId: string | null
  createdAt: number
  updatedAt: number
}

export interface SettingsRepo {
  /**
   * 指定した設定を保存する
   * @param settings 設定
   */
  createOrUpdate(settings: Settings): Promise<void>

  /**
   * 指定した ID の設定を取得する
   */
  getOne(id: Settings["id"]): Promise<Settings | null>
}

const createSettingsRepo = (db: Promise<IDBPDatabase>): SettingsRepo => {
  const storeName = "settings"

  return {
    async createOrUpdate(settings: Settings): Promise<void> {
      const database = await db
      await database.put(storeName, settings)
    },

    async getOne(settingsId: Settings["id"]): Promise<Settings | null> {
      const database = await db
      const record = await database.get(storeName, settingsId)
      return record
    },
  }
}

export const [registerSettingsRepo, getSettingsRepo] = defineProxyService(
  "settingsRepo",
  createSettingsRepo,
)
