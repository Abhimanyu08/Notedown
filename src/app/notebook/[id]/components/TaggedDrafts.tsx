"use client";
import { Draft, RawObject } from "@utils/processDrafts";
import { DraftsDisplay } from "./DraftsDisplay";
import PostDisplay from "@components/PostComponents/PostDisplay";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { BiCheck, BiLink } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import Link from "next/link";

export function TaggedDrafts({
	children,
	tag,
}: {
	children: React.ReactNode;
	tag: string;
}) {
	const searchParams = useSearchParams();
	const params = useParams();
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 2000);
		}
	}, [copied]);

	let searchTag = null;
	if (searchParams && searchParams.has("tag")) {
		searchTag = searchParams.get("tag");
	}
	// if (tag === "notag") {
	// 	return (
	// 		<div
	// 			className={cn(
	// 				"flex flex-col gap-3",
	// 				searchTag && searchTag !== tag ? "hidden" : ""
	// 			)}
	// 		>
	// 			{children}
	// 			{/* <DraftsDisplay rawObjects={drafts} tag={tag} />
	// 			<PostDisplay posts={posts} tag={tag} /> */}
	// 		</div>
	// 	);
	// }

	return (
		<>
			<details
				open={searchTag === tag || tag === "notag" || false}
				className={cn(
					"relative ",
					searchTag && searchTag !== tag ? "hidden" : ""
				)}
			>
				<summary
					className={cn(
						"font-serif marker:text-gray-400 text-gray-100 text-lg cursor-pointer group/tag",
						tag === "notag" && "hidden"
					)}
				>
					{tag}
					<ToolTipComponent
						tip="Copy tag link"
						side="left"
						className="absolute invisible group-hover/tag:visible hover:bg-secondary p-1 rounded-md top-2 right-3"
						onClick={() => {
							navigator.clipboard
								.writeText(
									window.location.origin +
										`/notebook/${params?.id}` +
										`?tag=${tag}`
								)
								.then(() => setCopied(true));
						}}
					>
						{copied ? <BiCheck size={14} /> : <BiLink size={14} />}
					</ToolTipComponent>
				</summary>

				<div
					className={cn(
						"border-l-2 border-border ml-4 mt-3 pl-4 gap-3 flex flex-col",
						tag === "notag" && "ml-0 border-l-0 pl-0"
					)}
				>
					{/* <DraftsDisplay rawObjects={drafts} tag={tag} />
				<PostDisplay posts={posts} tag={tag} /> */}
					{children}
				</div>
			</details>
			{searchTag && searchTag === tag && (
				<Button
					className="px-3 py-1 mt-4 w-fit self-center"
					variant={"secondary"}
				>
					<Link href={window.location.toString().split("?")[0]}>
						View all notes
					</Link>
				</Button>
			)}
		</>
	);
}
