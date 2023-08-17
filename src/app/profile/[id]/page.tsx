"use client";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { processNoTagDrafts } from "@utils/processDrafts";
import { useContext, useEffect, useState } from "react";
import PostsLoading from "./loading";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { TaggedDrafts } from "./_components/TaggedDrafts";
import { NoTagDrafts } from "./_components/NoTagDrafts";
import useRetrieveDrafts from "./_components/_hooks/useRetrieveDrafts";

function Drafts() {
	const { tagToDraftMap, loadingDrafts } = useRetrieveDrafts();

	if (loadingDrafts) {
		return <PostsLoading numPosts={6} />;
	}

	if (tagToDraftMap.size > 0) {
		return (
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
				{Array.from(tagToDraftMap.keys()).map((tag) => {
					if (tag !== "notag")
						return (
							<TaggedDrafts
								tag={tag}
								rawObjects={
									tagToDraftMap.get(tag as string) || []
								}
							/>
						);
				})}
				{tagToDraftMap.has("notag") && (
					<NoTagDrafts
						rawObjects={tagToDraftMap.get("notag") || []}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 mt-20 mx-10 font-serif italic text-left text-gray-500 text-lg">
			<span>Lying in wait, set to pounce on the blank page,</span>
			<span>are letters up to no good,</span>
			<span>clutches of clauses so subordinate</span>
			<span>they{`'`}ll never let her get away.</span>

			<span className="underline underline-offset-2 text-sm self-center">
				- The Joy Of Writing, Wislawa Szymborska
			</span>
		</div>
	);
}

export default Drafts;
