"use client";
import React, { useState } from "react";
import { ExpandButton } from "../../components/ModalButtons";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { BiBookContent } from "react-icons/bi";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { getPost } from "@/app/utils/getData";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@components/ui/button";

function PostPreviewControls({
	post,
	content,
}: Omit<Awaited<ReturnType<typeof getPost>>, "imagesToUrls" | "markdown">) {
	const [showToc, setShowToc] = useState(false);
	return (
		<>
			<div className="flex flex-col items-center absolute gap-3 right-0 top-[45%]  bg-black opacity-40 hover:opacity-100  w-fit border-r-0  border-[1px] border-border [&>*]:p-2">
				<ExpandButton
					postId={post.id!}
					privatePost={post.published!}
					className="
				text-gray-400 hover:text-white active:scale-95"
				/>
				<EnableRceButton
					className="
				text-gray-400 hover:text-white active:scale-95"
				/>
				<Button
					className="text-gray-400 hover:text-white active:scale-95"
					// onClick={() => setShowToc((p) => !p)}
					onMouseOver={() => setShowToc(true)}
					onMouseLeave={() => setShowToc(false)}
				>
					<BiBookContent size={24} />
				</Button>
			</div>
			<AnimatePresence>
				{showToc && (
					<motion.div
						className="h-fit absolute py-4 px-5 bg-black right-12 w-fit border-border border-[1px] shadow-md  shadow-gray-200 max-w-[400px] max-h-[500px] overflow-y-auto"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onMouseOver={() => setShowToc(true)}
						onMouseLeave={() => setShowToc(false)}
					>
						<Toc html={content} />
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

export default PostPreviewControls;
