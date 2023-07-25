"use client";
import ActionModal from "@components/Modals/ActionModal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import PostsLoading from "../loading";
import formatDate from "@utils/dateFormatter";
import { parseFrontMatter } from "@utils/getResources";

type Draft = {
	key: string;
	timeStamp: string;
	time: string;
	date: string;
	draftData: Awaited<ReturnType<typeof parseFrontMatter>>;
	postId?: string;
};

function Drafts() {
	const [drafts, setDrafts] = useState<Draft[]>([]);
	const [loadingDrafts, setLoadingDrafts] = useState(false);
	const [timeStampToDelete, setTimeStampToDelete] = useState("");

	useEffect(() => {
		// if (drafts && drafts.length > 0) return;
		processDrafts();
	}, []);

	function processDrafts() {
		setLoadingDrafts(true);
		const draftsToAdd: typeof drafts = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && (key.startsWith("draft") || key.startsWith("post"))) {
				const timeStamp = /draft-(\d+)$/.exec(key)?.at(1);
				const postId = /post-(\d+);/.exec(key)?.at(1);
				const draftText = localStorage.getItem(key);
				const draftData = parseFrontMatter(draftText!);
				if (timeStamp) {
					const formattedTimeStamp = new Date(parseInt(timeStamp));
					const date = formatDate(
						formattedTimeStamp.toLocaleDateString()
					);
					const longTime = formattedTimeStamp.toLocaleTimeString();

					const amOrPm = longTime.match(/[AP]M/)?.at(0);
					const shortTime = longTime.split(":").slice(0, 2).join(":");
					const time = `${shortTime} ${amOrPm}`;
					draftsToAdd.push({
						key,
						timeStamp,
						date,
						time,
						draftData,
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
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto px-2">
				{!loadingDrafts ? (
					<>
						{drafts.length > 0 ? (
							<>
								{drafts.map((draft) => {
									return (
										<div
											className="flex flex-col  relative"
											key={draft.timeStamp}
										>
											<ActionModal
												action="delete"
												postTitle={
													draft.draftData.data.title
												}
												visible={
													timeStampToDelete ===
													draft.timeStamp
												}
												onClose={() =>
													setTimeStampToDelete("")
												}
												isActionPending={false}
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
													setTimeStampToDelete("");
												}}
											/>
											<button
												className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
												onClick={() =>
													setTimeStampToDelete(
														draft.timeStamp
													)
												}
											>
												<MdDelete />
											</button>
											<SingleDraft draft={draft} />
										</div>
									);
								})}
							</>
						) : (
							<div className="text-gray-500 ">
								<p>
									This is where all your notes which you
									decide not to upload (or forget to hit the
									upload button on) will be displayed.
								</p>
								<br />
								<p>
									Those notes are basically stored in your
									browser{`'`}s localStorage i.e they are on
									your machine, sitting safely on **your**
									computer{`'`}s memory and can{`'`}t be
									accessed on any other device.
								</p>
							</div>
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
