/**
 * CSS セレクターに一致する HTML 要素が現れるまで待機する関数
 *
 * - セレクターに一致する要素が現れた場合、その要素で解決するプロミスを返す
 * - 操作を中止した場合、その理由 ({@linkcode AbortSignal.reason}) で拒否するプロミスを返す
 *
 * @param selectors CSS セレクター
 * @param options オプション
 * @param options.signal 中止シグナル（デフォルトでは 30 秒後にタイムアウトする）
 * @returns HTML 要素
 */
export const waitForSelector = <T extends Element = Element>(
  selectors: string,
  { signal }: { signal: AbortSignal } = { signal: AbortSignal.timeout(30000) },
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    // すでに操作が中止されているかチェック
    if (signal.aborted) return reject(signal.reason)

    // すでに要素が存在するかチェック
    const element = document.querySelector<T>(selectors)
    if (element) return resolve(element)

    const cleanUp = () => {
      observer.disconnect()
      signal.removeEventListener("abort", onAbort)
    }

    const onAbort = () => {
      cleanUp()
      reject(signal.reason)
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selectors)

      if (element) {
        cleanUp()
        resolve(element)
      }
    })

    observer.observe(document, { childList: true, subtree: true })
    signal.addEventListener("abort", onAbort)
  })
}
