"use client";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function PostOnPreviewColor({ href }: { href: string }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const onPreview = pathname + "?" + searchParams?.toString() === href;

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
