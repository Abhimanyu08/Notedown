"use client";
import { useContext } from "react";
import { ProfileContext } from "./_components/ProfileContext";
import { TaggedDrafts } from "./_components/TaggedDrafts";
import PostsLoading from "./loading";
import { DraftsDisplay } from "./_components/DraftsDisplay";
import PostDisplay from "@components/PostDisplay";

function Drafts() {
	const { loadingDrafts, draftAndPostMap } = useContext(ProfileContext);
	if (loadingDrafts) {
		return <PostsLoading numPosts={6} />;
	}

	if (draftAndPostMap.size > 0) {
		return (
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
				{Array.from(draftAndPostMap.keys()).map((tag) => {
					if (tag === "notag") return;
					const drafts =
						draftAndPostMap.get(tag as string)?.drafts || [];
					const posts =
						draftAndPostMap.get(tag as string)?.posts || [];
					return (
						<>
							<TaggedDrafts tag={tag} key={tag}>
								<DraftsDisplay rawObjects={drafts} tag={tag} />
								<PostDisplay posts={posts} tag={tag} />
							</TaggedDrafts>
						</>
					);
				})}
				{draftAndPostMap.has("notag") && (
					<TaggedDrafts tag="notag" key={"notag"}>
						<DraftsDisplay
							rawObjects={
								draftAndPostMap.get("notag")?.drafts || []
							}
							tag={"notag"}
						/>
						<PostDisplay
							posts={draftAndPostMap.get("notag")?.posts || []}
							tag={"notag"}
						/>
					</TaggedDrafts>
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
