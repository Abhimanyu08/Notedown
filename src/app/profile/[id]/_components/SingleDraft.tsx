"use client";
import PostTitle from "@components/PostTitle";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { DraftActions } from "./DraftActions";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

export function SingleDraft({ draft }: { draft: Draft }) {
	const { title, description } = draft;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftOnPreviewIndicator draftId={draft.timeStamp} />
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

function DraftOnPreviewIndicator({ draftId }: { draftId: string }) {
	const params = useParams();
	const onPreview =
		params?.draftId === draftId || `draft-${params?.draftId}` === draftId;
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
