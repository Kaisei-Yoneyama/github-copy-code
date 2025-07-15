import { IDBPDatabase, openDB } from "idb"

export function openExtensionDatabase(): Promise<IDBPDatabase> {
  return openDB("githubCopyCode", 1, {
    upgrade(database) {
      database
        .createObjectStore("templates", { keyPath: "id" })
        .createIndex("isDefault", "isDefault")
    },
  })
}
