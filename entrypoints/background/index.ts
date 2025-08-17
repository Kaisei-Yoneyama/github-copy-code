import { onMessage } from "@/entrypoints/background/messaging"

export default defineBackground(() => {
  const db = openExtensionDatabase()
  registerTemplatesRepo(db)
  registerSettingsRepo(db)
  registerTemplatesService(getTemplatesRepo(), getSettingsRepo())
  registerSettingsService(getSettingsRepo())

  onMessage("fetchUrl", async (message) => {
    const response = await fetch(message.data)

    if (response.ok) return await response.text()
    else throw new Error(response.statusText)
  })
})
