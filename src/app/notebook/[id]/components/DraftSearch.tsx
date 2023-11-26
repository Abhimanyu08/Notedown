"use client";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import useOwner from "@/hooks/useOwner";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { Draft, RawObject, rawObjectToDraft } from "@utils/processDrafts";
import React, { useContext, useState } from "react";
import { SingleDraft } from "./SingleDraft";

function DraftSearch({ query }: { query: string }) {
	let searchQuery = query.trim().split(" ").join(" | ");
	const owner = useOwner();
	const { documentDb } = useContext(IndexedDbContext);
	const [draftSearchResults, setDraftSearchResults] = useState<
		Draft[] | null
	>(null);
	if (owner && documentDb) {
		const results: RawObject[] = [];
		const mdObjectStore = getMarkdownObjectStore(documentDb);
		const markdownIndex = mdObjectStore.index("markdownIndex");

		markdownIndex.openCursor().onsuccess = (e) => {
			const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

			if (cursor) {
				const record = cursor.value as RawObject;
				const regexpQuery = new RegExp(searchQuery, "i");
				const searchRes = record.markdown.search(regexpQuery);
				if (searchRes > -1) {
					results.push(record);
				}
				cursor.continue();
			} else {
				setDraftSearchResults(results.map((r) => rawObjectToDraft(r)));
			}
		};
	}
	return (
		<>
			{draftSearchResults?.map((draft) => (
				<div
					className="flex flex-col relative gap-3"
					key={draft.timeStamp}
				>
					<SingleDraft draft={draft} />
				</div>
			))}
		</>
	);
}

export default DraftSearch;
