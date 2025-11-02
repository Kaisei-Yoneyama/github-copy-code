let sandbox: HTMLIFrameElement | null = null

export const ensureSandboxContentWindow = (): Window => {
  if (sandbox) {
    return sandbox.contentWindow!
  }

  sandbox = document.createElement("iframe")
  sandbox.src = browser.runtime.getURL("/template-renderer.html")
  sandbox.style.display = "none"
  document.body.appendChild(sandbox)

  return sandbox.contentWindow!
}

export async function retry<T>(
  task: () => T | Promise<T>,
  baseMs = 500,
  attempts = 5,
): Promise<T> {
  try {
    return await Promise.try(task)
  } catch (error) {
    if (attempts < 1) throw error
    await new Promise((resolve) => setTimeout(resolve, baseMs))
    return retry(task, attempts - 1, baseMs * 2)
  }
}

export type SandboxMessageMap = {
  render: {
    req: { templateSource: string; context: unknown }
    res: { success: true; result: string } | { success: false; error: string }
  }
  validate: {
    req: { templateSource: string }
    res: { success: true } | { success: false; error: string }
  }
}

// TODO: AbortSignal に対応する
export const sendMessage = <K extends keyof SandboxMessageMap>(
  command: K,
  message: SandboxMessageMap[K]["req"],
  targetWindow: Window = window,
  targetOrigin: string = "*",
): Promise<SandboxMessageMap[K]["res"]> =>
  new Promise((resolve, reject) => {
    const messageId = crypto.randomUUID()
    const timeoutId = setTimeout(() => {
      cleanUp()
      reject(new Error(`Request timed out`))
    }, 50) // リトライを考慮して短めに設定
    const handleMessage = (event: MessageEvent) => {
      if (event.data.messageId === messageId) {
        cleanUp()
        resolve(event.data.message)
      }
    }
    const cleanUp = () => {
      window.removeEventListener("message", handleMessage)
      clearTimeout(timeoutId)
    }
    window.addEventListener("message", handleMessage)
    targetWindow.postMessage({ command, messageId, message }, targetOrigin)
  })
