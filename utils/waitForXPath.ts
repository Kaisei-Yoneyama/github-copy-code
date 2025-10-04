/**
 * XPath 式に一致するノードが現れるまで待機する関数
 *
 * - XPath 式に一致するノードが現れた場合、そのノードで解決するプロミスを返す
 * - 操作を中止した場合、その理由 ({@linkcode AbortSignal.reason}) で拒否するプロミスを返す
 *
 * @param xpath XPath 式
 * @param options オプション
 * @param options.signal 中止シグナル（デフォルトは 30 秒後に中止するシグナル）
 * @returns XPath 式に一致するノードで解決するプロミス
 */
export const waitForXPath = <T extends Node = Node>(
  xpath: string,
  { signal }: { signal: AbortSignal } = { signal: AbortSignal.timeout(30000) },
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    // すでに操作が中止されているかチェック
    if (signal.aborted) return reject(signal.reason)

    const evaluateXPath = (): T | null => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      )
      return result.singleNodeValue as T | null
    }

    // すでにノードが存在するかチェック
    const node = evaluateXPath()
    if (node) return resolve(node)

    const cleanUp = () => {
      observer.disconnect()
      signal.removeEventListener("abort", handleAbort)
    }

    const handleAbort = () => {
      cleanUp()
      reject(signal.reason)
    }

    const observer = new MutationObserver(() => {
      const node = evaluateXPath()

      if (node) {
        cleanUp()
        resolve(node)
      }
    })

    observer.observe(document, { childList: true, subtree: true })
    signal.addEventListener("abort", handleAbort)
  })
}
