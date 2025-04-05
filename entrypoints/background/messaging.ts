import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  fetchUrl(url: URL | string): string
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
