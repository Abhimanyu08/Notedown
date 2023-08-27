"use client";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AiFillCloseCircle, AiFillEdit } from "react-icons/ai";
import { BiBookContent } from "react-icons/bi";
import { ExpandButton } from "../ProfileComponents/ModalButtons";
import Link from "next/link";

function PostPreviewControls({
	content,
	postId,
	draftId,
}: {
	content: string;
	postId?: number;
	draftId?: string | null;
}) {
	const [showToc, setShowToc] = useState(false);
	const router = useRouter();
	const params = useParams();

	const getEditLink = () => {
		if (postId && draftId) {
			return `/write/${postId}?draft=${draftId}`;
		}
		if (postId) {
			return `/write/${postId}`;
		}
		if (draftId) {
			return `/write?draft=${draftId}`;
		}
		return null;
	};

	return (
		<>
			<div className="flex flex-col items-center fixed gap-3 right-0 top-[45%]  bg-secondary opacity-40 hover:opacity-100  w-fit border-r-0  border-[1px] border-border [&>*]:p-2">
				<ExpandButton
					className="
				text-gray-400 hover:text-white active:scale-95"
				/>
				<EnableRceButton />
				<Button
					className="bg-transparent hover:text-gray-100 text-gray-400 hover:bg-transparent"
					onClick={() => setShowToc((p) => !p)}
				>
					<BiBookContent size={24} />
				</Button>
				<ToolTipComponent tip="Edit">
					<Link
						href={getEditLink() || ""}
						prefetch={false}
						className="flex gap-2 items-center text-gray-400 hover:text-white"
					>
						<AiFillEdit className="inline" size={24} />{" "}
					</Link>
				</ToolTipComponent>
				<ToolTipComponent
					tip="Close preview"
					onClick={() => {
						router.push(`/profile/${params?.id}`);
					}}
					className=" text-gray-400 hover:text-white active:scale-95"
				>
					<AiFillCloseCircle size={24} />
				</ToolTipComponent>
			</div>
			<div
				className={`h-fit fixed py-4 px-5 bg-secondary right-12 top-[45%]  border-border border-2  w-[400px] max-h-[450px] overflow-auto z-[1000]
						${showToc ? "opacity-100" : "opacity-0"}
						transition-opacity duration-200
					`}
				// onMouseLeave={() => setShowToc(false)}
			>
				<Toc markdown={content} />
			</div>
		</>
	);
}

export default PostPreviewControls;
