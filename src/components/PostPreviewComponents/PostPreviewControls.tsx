"use client";
import React, { useState } from "react";
import { ExpandButton } from "../ProfileComponents/ModalButtons";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { BiBookContent } from "react-icons/bi";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { getPost } from "@/app/utils/getData";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { AiFillCloseCircle } from "react-icons/ai";
import useShortCut from "@/hooks/useShortcut";

function PostPreviewControls({
	post,
	content,
}: Pick<Awaited<ReturnType<typeof getPost>>, "post"> & { content: string }) {
	const [showToc, setShowToc] = useState(false);
	const router = useRouter();
	const params = useParams();
	useShortCut({
		keys: ["Escape"],
		callback: () => router.push(`/profile/${params?.id}`),
	});

	return (
		<>
			<div className="flex flex-col items-center absolute gap-3 right-0 top-[45%]  bg-black opacity-40 hover:opacity-100  w-fit border-r-0  border-[1px] border-border [&>*]:p-2">
				<ExpandButton
					postId={post.id!}
					published={post.published}
					className="
				text-gray-400 hover:text-white active:scale-95"
				/>
				{post.language && (
					<EnableRceButton
						className="
				text-gray-400 hover:text-white active:scale-95"
					/>
				)}
				<ToolTipComponent tip="Table of contents">
					<Button
						className="text-gray-400 hover:text-white active:scale-95"
						onClick={() => setShowToc((p) => !p)}
					>
						<BiBookContent size={24} />
					</Button>
				</ToolTipComponent>
				<ToolTipComponent
					tip="Close preview (Esc)"
					onClick={() => {
						router.push(`/profile/${params?.id}`);
					}}
					className=" text-gray-400 hover:text-white active:scale-95"
				>
					<AiFillCloseCircle size={24} />
				</ToolTipComponent>
			</div>
			{/* <AnimatePresence>
				{showToc && (
					<motion.div
						className="h-fit absolute py-4 px-5 bg-black right-12 w-fit border-border border-[1px]  max-w-[400px] max-h-[500px] overflow-y-auto ring-2 ring-gray-300"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onMouseLeave={() => setShowToc(false)}
					>
						<Toc html={content} />
					</motion.div>
				)}
			</AnimatePresence> */}
		</>
	);
}

export default PostPreviewControls;
