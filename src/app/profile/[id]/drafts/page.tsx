"use client";
import ActionModal from "@components/Modals/ActionModal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import PostsLoading from "../loading";
import formatDate from "@utils/dateFormatter";
import { parseFrontMatter } from "@utils/getResources";
import PostTitle from "@components/PostTitle";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@components/ui/menubar";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";

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

	useEffect(() => {
		let documentDbRequest = indexedDB.open("RCEBLOG_DOCUMENT", 4);
		documentDbRequest.onsuccess = (e) => {
			const documentDb = (e.target as IDBOpenDBRequest).result;
			processDrafts(documentDb);
		};
	}, []);

	function processDrafts(db: IDBDatabase) {
		setLoadingDrafts(true);
		const draftsToAdd: typeof drafts = [];
		let objectStore = db
			.transaction("markdown", "readwrite")
			.objectStore("markdown");
		const getAllMarkdowns = objectStore.getAll();

		getAllMarkdowns.onsuccess = (e) => {
			const mdWithTsArray = (
				e.target as IDBRequest<
					{ timeStamp: string; markdown: string; postId?: string }[]
				>
			).result;

			for (let mdWithTs of mdWithTsArray) {
				const {
					timeStamp: timeStampWithPostId,
					markdown,
					postId,
				} = mdWithTs;
				const timeStamp = /draft-(\d+)$/
					.exec(timeStampWithPostId)
					?.at(1);

				const draftData = parseFrontMatter(markdown);
				if (timeStamp) {
					const formattedTimeStamp = new Date(parseInt(timeStamp));
					const date = formatDate(formattedTimeStamp);
					const longTime = formattedTimeStamp.toLocaleTimeString();

					const amOrPm = longTime.match(/[ap]m/)?.at(0);
					const shortTime = longTime.split(":").slice(0, 2).join(":");
					const time = `${shortTime} ${amOrPm}`;
					draftsToAdd.push({
						key: timeStampWithPostId,
						timeStamp,
						date,
						time,
						draftData,
						postId,
					});
				}
			}
			setDrafts(
				draftsToAdd.sort(
					(a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
				)
			);
			setLoadingDrafts(false);
		};
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
											className="flex flex-col  relative"
											key={draft.timeStamp}
										>
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
	const { data } = draft.draftData;

	return (
		<div className="flex flex-col group p-2 relative">
			<DraftActions draft={draft} />
			<Link href={`/draft/${draft.timeStamp}`} className="">
				<PostTitle
					title={data?.title || ""}
					description={data?.description}
				/>
				<p className="text-sm text-gray-400 mt-2">
					<span className="">{draft.date}</span>,{" "}
					<span className="">{draft.time}</span>
				</p>
			</Link>
		</div>
	);
}

function DraftActions({ draft }: { draft: Draft }) {
	return (
		<Menubar
			className="absolute top-3 right-3 w-fit h-fit border-none
					rounded-full bg-transparent hover:bg-accent
				"
		>
			<MenubarMenu>
				<MenubarTrigger className="p-1">
					<SlOptions size={12} />
				</MenubarTrigger>
				<MenubarContent className="min-w-0 border-border">
					<MenubarItem className="">
						<Link
							href={
								draft.postId
									? `/write/${draft.postId}?draft=${draft.timeStamp}`
									: `/write?draft=${draft.timeStamp}`
							}
							prefetch={false}
							className="flex gap-2 items-center"
						>
							<AiFillEdit className="inline" size={15} />{" "}
							<span>Edit</span>
						</Link>
					</MenubarItem>
					<MenubarItem>
						<AiFillDelete className="inline" size={15} /> Delete
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}

export default Drafts;
