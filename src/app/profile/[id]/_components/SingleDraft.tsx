"use client";
import PostTitle from "@components/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";

export function SingleDraft({ draft, tag }: { draft: Draft; tag?: string }) {
	const { title, description } = draft;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftOnPreviewIndicator draftId={draft.timeStamp} tag={tag} />
			<DraftActions draft={draft} />
			<Link href={`/draft/${draft.timeStamp}?tag=${tag}`} className="">
				<PostTitle title={title || ""} description={description} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
				</p>
			</Link>
		</div>
	);
}

function DraftOnPreviewIndicator({
	draftId,
	tag,
}: {
	draftId: string;
	tag?: string;
}) {
	const params = useParams();
	const searchParams = useSearchParams();
	const onPreview =
		(params?.draftId === draftId ||
			`draft-${params?.draftId}` === draftId) &&
		searchParams?.get("tag") === tag;
	if (!onPreview) return <></>;
	return (
		<motion.div
			layoutId="preview-indicator"
			transition={{
				type: "spring",
				stiffness: 350,
				damping: 30,
			}}
			className={`absolute top-0 left-0  rounded-md w-full h-full -z-10 ${
				onPreview ? "bg-gray-900" : ""
			}`}
		></motion.div>
	);
}
