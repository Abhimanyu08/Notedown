"use client";
import PostComponent from "@components/PostComponent";
import React, { useContext } from "react";
import { SearchContext } from "./SearchProvider";
import { SinglePostLoading } from "./SinglePostLoading";
import { rawObjectToDraft } from "@utils/processDrafts";
import PostDisplay from "@components/PostDisplay";
import Divider from "@components/ui/divider";
import { DraftsDisplay } from "@/app/profile/[id]/_components/DraftsDisplay";

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
			// const drafts = draftSearchResults.map((raw) =>
			// 	rawObjectToDraft(raw)
			// );
			return (
				<div className="flex flex-col">
					<Divider>Uploaded</Divider>
					<PostDisplay posts={searchResults} />
					<Divider>Drafts</Divider>
					<DraftsDisplay rawObjects={draftSearchResults} />
				</div>
			);
		}

		if (searchResults.length > 0) {
			return <PostDisplay posts={searchResults} />;
		}
		if (draftSearchResults.length > 0) {
			return <DraftsDisplay rawObjects={draftSearchResults} />;
		}
	}

	return <>{children}</>;
}

export default NormalChildrenLayout;
