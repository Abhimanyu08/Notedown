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
	const params = useParams();
	const searchParams = useSearchParams();
	const onPreview =
		(parseInt(params?.postId as string) === postId ||
			slug === params?.postId) &&
		searchParams?.get("tagpreview") === tag;
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
