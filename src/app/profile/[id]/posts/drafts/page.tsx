"use client";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import PostsLoading from "../loading";
import { MdDelete } from "react-icons/md";

function Drafts() {
	const [drafts, setDrafts] = useState<
		| {
				key: string;
				timeStamp: string;
				time: string;
				date: string;
				draftData: Awaited<ReturnType<typeof getHtmlFromMarkdownFile>>;
				postId?: string;
		  }[]
		| null
	>(null);

	useEffect(() => {
		if (drafts && drafts.length > 0) return;
		processDrafts();
	}, []);

	async function processDrafts() {
		const draftsToAdd: typeof drafts = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && (key.startsWith("draft") || key.startsWith("post"))) {
				const timeStamp = /draft-(\d+)$/.exec(key)?.at(1);
				const postId = /post-(\d+);/.exec(key)?.at(1);
				const draftText = localStorage.getItem(key);
				const { data, content } = await getHtmlFromMarkdownFile(
					draftText!
				);
				if (timeStamp) {
					const formattedTimeStamp = new Date(parseInt(timeStamp));
					draftsToAdd.push({
						key,
						timeStamp,
						date: formattedTimeStamp.toLocaleDateString(),
						time: formattedTimeStamp.toLocaleTimeString(),
						draftData: { data, content },
						postId,
					});
				}
			}
		}
		setDrafts(draftsToAdd);
	}

	return (
		<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
			{drafts ? (
				<>
					{drafts.map((draft) => {
						return (
							<div
								className="flex flex-col relative"
								key={draft.timeStamp}
							>
								<button
									className="absolute top-2 right-2"
									onClick={() => {
										localStorage.removeItem(draft.key);
										setDrafts((prev) => {
											const newDrafts = prev!.filter(
												(d) => d.key !== draft.key
											);
											return newDrafts;
										});
									}}
								>
									<MdDelete />
								</button>
								<Link
									href={
										draft.postId
											? `/write/${draft.postId}?draft=${draft.timeStamp}`
											: `/write?draft=${draft.timeStamp}`
									}
									className="text-lg text-black font-semibold hover:italic hover:underline dark:text-white truncate w-3/4"
								>
									{draft.draftData.data.title}
								</Link>
								<p className="text-sm md:text-base mt-1 text-black dark:text-font-grey font-sans ">
									{draft.draftData.data.description}
								</p>
								<p className="text-sm text-font-grey mt-2">
									created on{" "}
									<span className="text-gray-100 font-bold">
										{draft.date}
									</span>{" "}
									at{" "}
									<span className="text-gray-100 font-bold">
										{draft.time}
									</span>
								</p>
							</div>
						);
					})}
				</>
			) : (
				<PostsLoading />
			)}
		</div>
	);
}

export default Drafts;
