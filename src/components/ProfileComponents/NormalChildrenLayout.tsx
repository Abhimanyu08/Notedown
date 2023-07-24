"use client";
import PostComponent from "@components/PostComponent";
import React, { useContext } from "react";
import { SearchContext } from "./SearchProvider";
import { SinglePostLoading } from "./SinglePostLoading";

function NormalChildrenLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const { searchMeta } = useContext(SearchContext);

	if (searchMeta) {
		const { searchError, searchResults, searching } = searchMeta;

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

		if (searchResults.length > 0) {
			return (
				<div className="flex flex-col gap-3">
					{searchResults.map((post) => (
						<PostComponent key={post.id} post={post} />
					))}
				</div>
			);
		}
	}

	return <>{children}</>;
}

export default NormalChildrenLayout;
