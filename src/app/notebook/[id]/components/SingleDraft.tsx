import PostTitle from "@components/PostComponents/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { DraftOnPreviewIndicator } from "./DraftOnPreviewIndicator";

export type SingleDraftProp = { draft: Draft; tag?: string };

export function SingleDraft({ draft, tag }: SingleDraftProp) {
	const { title } = draft;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftOnPreviewIndicator draftId={draft.timeStamp} tag={tag} />
			<DraftActions draft={draft} />
			<Link
				href={`/draft/${draft.timeStamp}?tagpreview=${tag}`}
				className=""
			>
				<PostTitle title={title || ""} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
				</p>
			</Link>
		</div>
	);
}
