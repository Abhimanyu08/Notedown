import PostTitle from "@components/PostComponents/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { DraftOnPreviewIndicator } from "./DraftOnPreviewIndicator";
import { usePathname } from "next/navigation";

export type SingleDraftProp = { draft: Draft; tag?: string };

export function SingleDraft({ draft, tag }: SingleDraftProp) {
	const { title, description } = draft;
	const pathname = usePathname();
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftOnPreviewIndicator draftId={draft.timeStamp} tag={tag} />
			<DraftActions draft={draft} />
			<Link
				href={`/draft/${draft.timeStamp}?tagpreview=${tag}`}
				className=""
				replace={!pathname?.startsWith("/notebook")}
			>
				<PostTitle title={title || ""} description={description} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
				</p>
			</Link>
		</div>
	);
}
