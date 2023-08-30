"use client";
import { Draft, RawObject } from "@utils/processDrafts";
import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from "react";
import useRetrieveDrafts from "./_hooks/useRetrieveDrafts";

export const ProfileContext = createContext<{
	draftAndPostMap: Map<string, { drafts: RawObject[]; posts: Draft[] }>;
	loadingDrafts: boolean;
	setLoadDrafts: Dispatch<SetStateAction<boolean>>;
}>({
	draftAndPostMap: new Map(),
	loadingDrafts: true,
	setLoadDrafts: () => null,
});

function ProfileContextProvider({
	children,
	tagToPostMap,
}: {
	children: React.ReactNode;
	tagToPostMap: Map<string, Draft[]>;
}) {
	const [loadDrafts, setLoadDrafts] = useState(true);
	const { tagToDraftMap } = useRetrieveDrafts({ loadDrafts, setLoadDrafts });

	const [draftAndPostMap, setDraftAndPostMap] = useState<
		Map<string, { drafts: RawObject[]; posts: Draft[] }>
	>(new Map());

	useEffect(() => {
		if (loadDrafts) return;

		const map: Map<string, { drafts: RawObject[]; posts: Draft[] }> =
			new Map();

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
		setLoadDrafts(false);
	}, [loadDrafts, tagToPostMap]);

	return (
		<ProfileContext.Provider
			value={{
				draftAndPostMap,
				loadingDrafts: loadDrafts,
				setLoadDrafts,
			}}
		>
			{children}
		</ProfileContext.Provider>
	);
}

export default ProfileContextProvider;
