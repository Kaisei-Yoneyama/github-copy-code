import { onMessage } from "@/entrypoints/background/messaging"

export default defineBackground(() => {
  onMessage("fetchUrl", async (message) => {
    const response = await fetch(message.data)

    if (response.ok) return await response.text()
    else throw new Error(response.statusText)
  })
})
