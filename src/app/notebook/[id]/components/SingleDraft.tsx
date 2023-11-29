import PostTitle from "@components/PostComponents/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { DraftOnPreviewIndicator } from "./DraftOnPreviewIndicator";
import { usePathname, useSearchParams } from "next/navigation";

export type SingleDraftProp = { draft: Draft; tag?: string };

export function SingleDraft({ draft, tag }: SingleDraftProp) {
	const { title } = draft;
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const href = searchParams?.has("showtag")
		? `${pathname}?showtag=${searchParams.get("showtag")}&draft=${
				draft.timeStamp
		  }&tag=${tag}`
		: `${pathname}?draft=${draft.timeStamp}&tag=${tag}`;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftOnPreviewIndicator draftId={draft.timeStamp} tag={tag} />
			<DraftActions draft={draft} tag={tag!} />
			<Link href={href} className="">
				<PostTitle title={title || ""} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
				</p>
			</Link>
		</div>
	);
}
