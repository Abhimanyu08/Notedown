export function getMarkdownObjectStore(db: IDBDatabase, scope?: "readonly" | "readwrite") {

    let objectStore = db
        .transaction("markdown", scope || "readwrite")
        .objectStore("markdown");
    return objectStore
}