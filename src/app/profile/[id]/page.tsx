"use client";
import { useContext } from "react";
import { ProfileContext } from "@/contexts/ProfileContext";
import { TaggedDrafts } from "./components/TaggedDrafts";
import PostsLoading from "./loading";
import { DraftsDisplay } from "./components/DraftsDisplay";
import PostDisplay from "@components/PostDisplay";
import { Button } from "@components/ui/button";
import Link from "next/link";

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
		<div className="flex flex-col gap-2 mt-20  items-center  text-gray-500 ">
			<div className="text-left flex flex-col gap-2 font-serif text-xl italic tracking-wide">
				<span>Lying in wait, set to pounce on the blank page,</span>
				<span>are letters up to no good,</span>
				<span>clutches of clauses so subordinate</span>
				<span>they{`'`}ll never let her get away.</span>
			</div>
			<span className="underline underline-offset-2 text-sm self-center">
				- The Joy Of Writing, Wislawa Szymborska
			</span>
			<Button
				variant={"secondary"}
				className="mt-10 w-fit px-3 py-1 self-center text-gray-400"
			>
				<Link href={"/write"}>Start writing</Link>
			</Button>
		</div>
	);
}

export default Drafts;
