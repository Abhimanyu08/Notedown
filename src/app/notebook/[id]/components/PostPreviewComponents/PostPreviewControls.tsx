"use client";
import useOwner from "@/hooks/useOwner";
import { cn } from "@/lib/utils";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { getPost } from "@utils/getData";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiBookContent } from "react-icons/bi";
import { BsArrowsAngleExpand } from "react-icons/bs";

function PostPreviewControls({
	markdown,
	postMeta,
}: {
	markdown: string;
	postMeta: Partial<Awaited<ReturnType<typeof getPost>>["post"]>;
}) {
	const [showToc, setShowToc] = useState(false);
	const searchParams = useSearchParams();
	const owner = useOwner(postMeta.created_by!);
	const { id: postId, timestamp: draftId } = postMeta;
	const pathname = usePathname();

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
			<div className="flex flex-col items-center fixed gap-3 right-0 top-[45%] bg-transparent opacity-40 hover:opacity-100  w-fit border-r-0  border-[1px] border-border [&>*]:p-2">
				<ToolTipComponent
					tip="Expand (E)"
					className={cn(
						"				text-gray-400 hover:text-white active:scale-95"
					)}
				>
					<Link
						href={
							searchParams?.has("note")
								? `/note/${searchParams.get("note")}`
								: `/draft/${searchParams?.get("draft")}`
						}
					>
						<BsArrowsAngleExpand size={20} />
					</Link>
				</ToolTipComponent>
				<Button
					className="bg-transparent hover:text-gray-100 text-gray-400 hover:bg-transparent"
					onClick={() => setShowToc((p) => !p)}
				>
					<BiBookContent size={24} />
				</Button>
				{(owner || pathname?.startsWith("/draft")) && (
					<ToolTipComponent tip={"Edit"}>
						<Link
							href={getEditLink() || ""}
							prefetch={false}
							className="flex gap-2 items-center text-gray-400 hover:text-white"
						>
							<AiFillEdit className="inline" size={24} />{" "}
						</Link>
					</ToolTipComponent>
				)}
			</div>
			<div
				className={`h-fit fixed py-4 px-5 bg-secondary right-12 top-[45%]  border-border border-2  w-[400px] max-h-[450px] overflow-auto z-[1000]
						${showToc ? "opacity-100 visible" : "opacity-0 invisible"}
						transition-opacity duration-200
					`}
				// onMouseLeave={() => setShowToc(false)}
			>
				<Toc markdown={markdown} />
			</div>
		</>
	);
}

export default PostPreviewControls;
