"use client";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import React, { createContext, useEffect, useState } from "react";

export const IndexedDbContext = createContext<{
	documentDb: IDBDatabase | null;
}>({
	documentDb: null,
});

function IndexedDbContextProvider({ children }: { children: React.ReactNode }) {
	const [documentDb, setDocumentDb] = useState<IDBDatabase | null>(null);

	useEffect(() => {
		let documentDbRequest = indexedDB.open("RCEBLOG", 1);

		documentDbRequest.onsuccess = (e) => {
			setDocumentDb((e.target as any).result);
		};

		documentDbRequest.onupgradeneeded = function () {
			let db = documentDbRequest.result;
			if (!db.objectStoreNames.contains("markdown")) {
				const mdObjectStore = db.createObjectStore("markdown", {
					keyPath: "timeStamp",
				});
				mdObjectStore.createIndex("markdownIndex", "markdown", {
					unique: false,
				});
			}
			if (!db.objectStoreNames.contains("sandpackConfigs")) {
				db.createObjectStore("sandpackConfigs", {
					keyPath: "timeStamp",
				});
			}
			if (!db.objectStoreNames.contains("images")) {
				db.createObjectStore("images", { keyPath: "imageName" });
			}
		};
	}, []);

	return (
		<IndexedDbContext.Provider value={{ documentDb }}>
			{children}
		</IndexedDbContext.Provider>
	);
}

export default IndexedDbContextProvider;
