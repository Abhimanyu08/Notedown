export function getMarkdownObjectStore(db: IDBDatabase, scope?: "readonly" | "readwrite") {

    let objectStore = db
        .transaction("markdown", scope || "readwrite")
        .objectStore("markdown");
    return objectStore
}
export function getMarkdownObjectStoreTransaction(db: IDBDatabase, scope?: "readonly" | "readwrite") {

    let objectStoreTransaction = db
        .transaction("markdown", scope || "readwrite")
    return objectStoreTransaction
}