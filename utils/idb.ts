import { IDBPDatabase, openDB } from "idb"

export const openExtensionDatabase = (): Promise<IDBPDatabase> => {
  return openDB("githubCopyCode", 1, {
    upgrade(database) {
      database
        .createObjectStore("templates", { keyPath: "id" })
        .createIndex("isDefault", "isDefault")
    },
  })
}
