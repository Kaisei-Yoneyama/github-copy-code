import { onMessage } from "@/entrypoints/background/messaging"

export default defineBackground(() => {
  const db = openExtensionDatabase()
  registerTemplatesRepo(db)

  onMessage("fetchUrl", async (message) => {
    const response = await fetch(message.data)

    if (response.ok) return await response.text()
    else throw new Error(response.statusText)
  })
})
