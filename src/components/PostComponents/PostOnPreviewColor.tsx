"use client";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

function PostOnPreviewColor({
	postId,
	tag,
	slug,
}: {
	postId: number;
	tag?: string;
	slug?: string;
}) {
	const searchParams = useSearchParams();

	let onPreview = false;
	if (searchParams?.has("note")) {
		const noteId = searchParams.get("note") as any;
		if (noteId == postId || noteId === slug) {
			if (tag === searchParams.get("tag")) {
				onPreview = true;
			}
		}
	}

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

export default PostOnPreviewColor;
