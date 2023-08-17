"use client";
import PostTitle from "@components/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";

export function SingleDraft({ draft }: { draft: Draft }) {
	const { title, description } = draft.draftMeta;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftActions draft={draft} />
			<Link href={`/draft/${draft.timeStamp}`} className="">
				<PostTitle title={title || ""} description={description} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
				</p>
			</Link>
		</div>
	);
}
