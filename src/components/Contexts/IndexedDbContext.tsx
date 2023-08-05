"use client";
import React, { createContext, useEffect, useState } from "react";

export const IndexedDbContext = createContext<{
	documentDb: IDBDatabase | null;
}>({
	documentDb: null,
});

function IndexedDbContextProvider({ children }: { children: React.ReactNode }) {
	const [documentDb, setDocumentDb] = useState<IDBDatabase | null>(null);

	useEffect(() => {
		let documentDbRequest = indexedDB.open("RCEBLOG_DOCUMENT", 4);

		documentDbRequest.onsuccess = (e) => {
			setDocumentDb((e.target as any).result);
		};

		documentDbRequest.onupgradeneeded = function () {
			let db = documentDbRequest.result;
			if (!db.objectStoreNames.contains("markdowns")) {
				db.createObjectStore("markdown", { keyPath: "timeStamp" });
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
