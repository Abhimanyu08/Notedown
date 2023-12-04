"use client";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import useOwner from "@/hooks/useOwner";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { Draft, RawObject, rawObjectToDraft } from "@utils/processDrafts";
import React, { useContext, useEffect, useState } from "react";
import { SingleDraft } from "./SingleDraft";
import Post from "@components/PostComponents/PostComponent";
import { createSupabaseBrowserClient } from "@utils/createSupabaseClients";

function DraftSearch({
	query,
	serverResults,
}: {
	query: string;
	serverResults: Draft[];
}) {
	let searchQuery = query.trim().split(" ").join(" | ");
	const owner = useOwner();
	const { documentDb } = useContext(IndexedDbContext);
	const [draftSearchResults, setDraftSearchResults] = useState<
		Draft[] | null
	>(null);

	const [uploadedInDrafts, setUploadedInDrafts] = useState<Draft[]>([]);

	useEffect(() => {
		if (owner && documentDb) {
			let results: RawObject[] = [];
			const mdObjectStore = getMarkdownObjectStore(documentDb);
			const markdownIndex = mdObjectStore.index("markdownIndex");

			markdownIndex.openCursor().onsuccess = (e) => {
				const cursor = (e.target as IDBRequest<IDBCursorWithValue>)
					.result;

				if (cursor) {
					const record = cursor.value as RawObject;
					const regexpQuery = new RegExp(searchQuery, "i");
					const searchRes = record.markdown.search(regexpQuery);
					if (searchRes > -1) {
						results.push(record);
					}
					cursor.continue();
				} else {
					console.log(results);
					let draftResults = results.map((r) => rawObjectToDraft(r));
					// we need to filter out results we have already got back from the server
					if (serverResults) {
						const serverTimeStamp = serverResults.map(
							(r) => r.timeStamp
						);
						draftResults = draftResults.filter(
							(d) => !serverTimeStamp.includes(d.timeStamp)
						);
					}
					console.log(draftResults);
					setDraftSearchResults(draftResults);
				}
			};
		}
	}, [query, serverResults, documentDb, owner]);

	useEffect(() => {
		if (!draftSearchResults || draftSearchResults.length === 0) return;

		const uploaded = draftSearchResults.filter((d) => d.postId);

		if (uploaded.length === 0) return;

		getPublishedStatus(uploaded.map((u) => u.postId!)).then(
			(idToPublished) => {
				if (!idToPublished) return;

				setUploadedInDrafts(
					uploaded.map((d) => ({
						...d,
						published: idToPublished.get(d.postId!),
					}))
				);
			}
		);
	}, [draftSearchResults]);

	return (
		<>
			{draftSearchResults?.map((draft) => {
				if (draft.postId) {
					return null;
				}
				return <SingleDraft draft={draft} key={draft.timeStamp} />;
			})}
			{uploadedInDrafts?.map((note) => {
				return <Post post={note} key={note.timeStamp} />;
			})}
		</>
	);
}

async function getPublishedStatus(postIds: number[]) {
	const supabase = createSupabaseBrowserClient();
	const { data } = await supabase
		.from("posts")
		.select("id, published")
		.in("id", postIds);

	if (data) {
		const idToPublished: Map<number, boolean> = new Map();
		data.map((d) => idToPublished.set(d.id, d.published));
		return idToPublished;
	}
}

export default DraftSearch;
