import { useState } from "react"
import type { PropsWithChildren, ReactNode } from "react"

import { Button } from "@primer/react"
import type { ButtonBaseProps } from "@primer/react"

const FEEDBACK_TIME_MS = 1000

type MaybePromise<T> = T | Promise<T>

type CopyButtonProps = {
  text: string | (() => MaybePromise<string>)
  feedback: ReactNode
} & ButtonBaseProps

export const CopyButton = ({
  text,
  feedback,
  children,
  ...props
}: PropsWithChildren<CopyButtonProps>) => {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    setLoading(true)

    try {
      const data =
        typeof text === "function"
          ? await Promise.try(text)
          : await Promise.resolve(text)
      await navigator.clipboard.writeText(data)

      setCopied(true)
      setTimeout(() => setCopied(false), FEEDBACK_TIME_MS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={copy} loading={loading} disabled={copied} {...props}>
      {copied ? feedback : children}
    </Button>
  )
}
