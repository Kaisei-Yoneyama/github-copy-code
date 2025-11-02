const renderer = getTemplateRenderer()

window.addEventListener("message", (event) => {
  const { command, messageId, message } = event.data

  const sendMessage = <K extends keyof SandboxMessageMap>(message: SandboxMessageMap[K]["res"]) => {
    if (event.source) {
      event.source.postMessage(
        { command, messageId, message },
        { targetOrigin: event.origin },
      )
    } else {
      throw new Error("Message emitter not found")
    }
  }

  switch (command) {
    case "render":
      try {
        const result = renderer.render(message.templateSource, message.context)
        sendMessage({ success: true, result })
      } catch (error) {
        sendMessage({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
      break
    case "validate":
      try {
        renderer.validate(message.templateSource)
        sendMessage({ success: true })
      } catch (error) {
        sendMessage({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
      break
  }
})
