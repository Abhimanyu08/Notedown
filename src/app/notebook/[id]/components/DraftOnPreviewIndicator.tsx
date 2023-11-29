"use client";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";

export function DraftOnPreviewIndicator({
	draftId,
	tag,
}: {
	draftId: string;
	tag?: string;
}) {
	const params = useParams();
	const searchParams = useSearchParams();
	const onPreview =
		params?.draftId === draftId && searchParams?.get("tagpreview") === tag;
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
				onPreview ? "bg-secondary" : ""
			}`}
		></motion.div>
	);
}
