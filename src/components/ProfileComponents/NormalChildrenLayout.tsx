"use client";
import PostComponent from "@components/PostComponent";
import React, { useContext } from "react";
import { SearchContext } from "./SearchProvider";
import { SinglePostLoading } from "./SinglePostLoading";
import { rawObjectToDraft } from "@utils/processDrafts";
import PostDisplay from "@components/PostDisplay";
import Divider from "@components/ui/divider";
import { DraftsDisplay } from "@/app/profile/[id]/_components/DraftsDisplay";
import { postToDraft } from "@utils/postToDraft";

function NormalChildrenLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const { searchMeta } = useContext(SearchContext);

	if (searchMeta) {
		const { searchError, searchResults, searching, draftSearchResults } =
			searchMeta;

		if (searching) {
			return (
				<div className="flex flex-col gap-10 bg-black z-50">
					{Array.from({ length: 4 }).map((_, i) => (
						<SinglePostLoading key={i} />
					))}
				</div>
			);
		}

		if (searchError) {
			return (
				<p className="text-white bg-black p-4 rounded-sm border-[1px] border-gray-500">
					{searchError.message}
				</p>
			);
		}

		if (searchResults.length > 0 && draftSearchResults.length > 0) {
			const postTimeStamps: string[] = [];
			const uploadedDrafts = searchResults.map((result) => {
				postTimeStamps.push(result.timestamp);
				return postToDraft(result);
			});
			const filteredDrafts = draftSearchResults.filter(
				(draft) => !postTimeStamps.includes(draft.timeStamp)
			);
			return (
				<div className="flex flex-col gap-4">
					<PostDisplay posts={uploadedDrafts} />
					<DraftsDisplay rawObjects={filteredDrafts} />
				</div>
			);
		}

		if (searchResults.length > 0) {
			return (
				<PostDisplay
					posts={searchResults.map((result) => postToDraft(result))}
				/>
			);
		}
		if (draftSearchResults.length > 0) {
			return <DraftsDisplay rawObjects={draftSearchResults} />;
		}
	}

	return <>{children}</>;
}

export default NormalChildrenLayout;
