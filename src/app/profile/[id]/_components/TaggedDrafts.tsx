import { Draft, RawObject } from "@utils/processDrafts";
import { DraftsDisplay } from "./DraftsDisplay";
import { Database } from "@/interfaces/supabase";
import PostDisplay from "@components/PostDisplay";

export function TaggedDrafts({
	tag,
	drafts,
	posts,
}: {
	tag: string;
	drafts: RawObject[];
	posts: Draft[];
}) {
	if (drafts.length === 0 && posts.length === 0) {
		return <></>;
	}
	if (tag === "notag") {
		return (
			<div className="pl-4 border-l-2 border-border ml-1 gap-4">
				<DraftsDisplay rawObjects={drafts} tag={tag} />
				<PostDisplay posts={posts} tag={tag} />
			</div>
		);
	}
	return (
		<details>
			<summary className="text-lg font-serif font-bold cursor-pointer">
				{tag}
			</summary>
			<div className="border-l-2 border-border ml-1 pl-4 gap-4">
				<DraftsDisplay rawObjects={drafts} tag={tag} />
				<PostDisplay posts={posts} tag={tag} />
			</div>
		</details>
	);
}
