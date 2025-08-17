import { defineProxyService } from "@webext-core/proxy-service"

export interface SettingsService {
  /**
   * デフォルトテンプレート ID を取得する
   */
  getDefaultTemplateId(): Promise<string | null>
}

const createSettingsService = (settingsRepo: SettingsRepo): SettingsService => {
  const SETTINGS_ID = "default"

  return {
    async getDefaultTemplateId(): Promise<string | null> {
      const settings = await settingsRepo.getOne(SETTINGS_ID)
      return settings?.defaultTemplateId ?? null
    },
  }
}

export const [registerSettingsService, getSettingsService] = defineProxyService(
  "settingsService",
  createSettingsService,
)
