"use client";
import { checkOnPreview } from "@utils/modifyDraftAndPostLink";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

function PostOnPreviewColor({ href }: { href: string }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const onPreview = checkOnPreview(pathname, searchParams, href);

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
