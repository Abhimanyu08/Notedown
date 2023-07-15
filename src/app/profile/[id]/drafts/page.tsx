"use client";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import PostsLoading from "../loading";
import { MdDelete } from "react-icons/md";
import ActionModal from "@components/Modals/ActionModal";

type Draft = {
	key: string;
	timeStamp: string;
	time: string;
	date: string;
	draftData: Awaited<ReturnType<typeof getHtmlFromMarkdownFile>>;
	postId?: string;
};

function Drafts() {
	const [drafts, setDrafts] = useState<Draft[]>([]);
	const [loadingDrafts, setLoadingDrafts] = useState(false);

	useEffect(() => {
		// if (drafts && drafts.length > 0) return;
		processDrafts();
	}, []);

	async function processDrafts() {
		setLoadingDrafts(true);
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
		setLoadingDrafts(false);
	}

	return (
		<>
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
				{!loadingDrafts ? (
					<>
						{drafts.length > 0 ? (
							<>
								{drafts.map((draft) => {
									return (
										<div
											className="flex flex-col relative"
											key={draft.timeStamp}
										>
											<ActionModal
												action="delete"
												postTitle={
													draft.draftData.data.title
												}
												isActionPending={false}
												postId={parseInt(
													draft.timeStamp
												)}
												onAction={() => {
													localStorage.removeItem(
														draft.key
													);
													setDrafts((prev) => {
														const newDrafts =
															prev!.filter(
																(d) =>
																	d.key !==
																	draft.key
															);
														return newDrafts;
													});
												}}
											/>
											<label
												className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
												htmlFor={`delete-${draft.timeStamp}`}
											>
												<MdDelete />
											</label>
											<SingleDraft draft={draft} />
										</div>
									);
								})}
							</>
						) : (
							<p className="text-gray-500">No Drafts to show</p>
						)}
					</>
				) : (
					<PostsLoading numPosts={6} />
				)}
			</div>
		</>
	);
}

function SingleDraft({ draft }: { draft: Draft }) {
	return (
		<>
			<Link
				href={
					draft.postId
						? `/write/${draft.postId}?draft=${draft.timeStamp}`
						: `/write?draft=${draft.timeStamp}`
				}
				className="text-lg text-black font-serif font-semibold hover:italic hover:underline dark:text-gray-100 truncate w-3/4"
			>
				{draft.draftData.data.title}
			</Link>

			<p className="text-sm text-gray-400 mt-2">
				created on{" "}
				<span className="text-gray-200 font-bold">{draft.date}</span> at{" "}
				<span className="text-gray-200 font-bold">{draft.time}</span>
			</p>
		</>
	);
}

export default Drafts;
