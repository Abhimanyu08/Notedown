"use client";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function Drafts() {
	const [drafts, setDrafts] = useState<
		{
			timeStamp: string;
			time: string;
			date: string;
			draftData: Awaited<ReturnType<typeof getHtmlFromMarkdownFile>>;
			postId?: string;
		}[]
	>([]);

	useEffect(() => {
		if (drafts.length > 0) return;
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
			{drafts.map((draft) => {
				return (
					<div className="flex flex-col">
						<Link
							href={
								draft.postId
									? `/appwrite/${draft.postId}?draft=${draft.timeStamp}`
									: `/appwrite?draft=${draft.timeStamp}`
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
		</div>
	);
}

export default Drafts;
