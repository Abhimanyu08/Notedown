"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

function PostOnPreviewColor({ postId }: { postId: number }) {
	const pathname = usePathname();
	const onPreview =
		pathname === `/post/${postId}` ||
		pathname === `/post/private/${postId}`;
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

export default PostOnPreviewColor;
