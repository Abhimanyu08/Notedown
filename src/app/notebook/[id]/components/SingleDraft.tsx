import PostTitle from "@components/PostComponents/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { usePathname, useSearchParams } from "next/navigation";
import modifyDraftAndPostLink from "@utils/modifyDraftAndPostLink";
import PostOnPreviewColor from "@components/PostComponents/PostOnPreviewColor";

export type SingleDraftProp = { draft: Draft; tag?: string };

export function SingleDraft({ draft, tag }: SingleDraftProp) {
	const { title } = draft;
	const pathname = usePathname();
	const searchParams = useSearchParams();

	let href = pathname + `?draft=${draft.timeStamp}`;

	href = modifyDraftAndPostLink(href, searchParams, tag);

	return (
		<div className="flex flex-col group p-2 relative ">
			<PostOnPreviewColor href={href} />
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
