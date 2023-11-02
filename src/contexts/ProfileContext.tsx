"use client";
import {
	Draft,
	processNoTagDrafts,
	rawObjectToDraft,
} from "@utils/processDrafts";
import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { IndexedDbContext } from "./IndexedDbContext";

type DraftAndPostMap = Map<string, { drafts: Draft[]; posts: Draft[] }>;

export const ProfileContext = createContext<{
	draftAndPostMap: DraftAndPostMap;
	setDraftAndPostMap: Dispatch<SetStateAction<DraftAndPostMap>>;
}>({
	draftAndPostMap: new Map(),
	setDraftAndPostMap: () => null,
});

function ProfileContextProvider({
	children,
	tagToPostMap,
}: {
	children: React.ReactNode;
	tagToPostMap: Map<string, Draft[]>;
}) {
	const [loadingDrafts, setLoadingDrafts] = useState(false);

	const { documentDb } = useContext(IndexedDbContext);

	const [draftAndPostMap, setDraftAndPostMap] = useState<DraftAndPostMap>(
		new Map()
	);
	const [tagToDraftMap, setTagToDraftMap] = useState(
		new Map<string, Draft[]>()
	);

	useEffect(() => {
		// load all the drafts first
		if (documentDb) {
			setLoadingDrafts(true);
			setTagToDraftMap(new Map());
			const mdObjectStore = getMarkdownObjectStore(
				documentDb,
				"readonly"
			);
			const tagsIndex = mdObjectStore.index("tagsIndex");

			const cursorRequest = tagsIndex.openCursor();
			cursorRequest.onsuccess = function (event) {
				const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
					.result;
				if (cursor) {
					const tag = cursor.key;
					setTagToDraftMap((p) => {
						const previousDrafts = p.get(tag as string) || [];
						previousDrafts?.push(rawObjectToDraft(cursor.value));
						p.set(tag as string, previousDrafts);
						return p;
					});

					cursor.continue();
				} else {
					// setLoadingDrafts(false);
				}
			};

			processNoTagDrafts(documentDb).then((rawObjs) => {
				setTagToDraftMap((p) => {
					p.set(
						"notag",
						rawObjs.map((r) => rawObjectToDraft(r))
					);
					setLoadingDrafts(false);
					return p;
				});
			});
		}
	}, [documentDb, tagToPostMap]);

	useEffect(() => {
		if (loadingDrafts) return;
		// once loading drafts is finished, merge them with posts
		const map: DraftAndPostMap = new Map();

		const allTags = [
			...Array.from(tagToDraftMap.keys()),
			...Array.from(tagToPostMap.keys()),
		];

		for (let tagName of allTags) {
			const postsWithThisTag = tagToPostMap.get(tagName) || [];
			const postTimeStamps = postsWithThisTag.map((p) => p.timeStamp);
			let draftsWithThisTag = tagToDraftMap.get(tagName) || [];
			draftsWithThisTag = draftsWithThisTag.filter(
				(d) => !postTimeStamps.includes(d.timeStamp)
			);
			if (postsWithThisTag.length > 0 || draftsWithThisTag.length > 0) {
				map.set(tagName, {
					posts: postsWithThisTag,
					drafts: draftsWithThisTag,
				});
			}
		}

		setDraftAndPostMap(map);
	}, [loadingDrafts, tagToPostMap]);

	return (
		<ProfileContext.Provider
			value={{
				draftAndPostMap,
				setDraftAndPostMap,
			}}
		>
			{children}
		</ProfileContext.Provider>
	);
}

export default ProfileContextProvider;
