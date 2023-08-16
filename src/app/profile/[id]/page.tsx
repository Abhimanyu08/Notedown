"use client";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import PostTitle from "@components/PostTitle";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@components/ui/menubar";
import {
	Draft,
	RawObject,
	processDrafts,
	rawObjectToDraft,
} from "@utils/processDrafts";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import PostsLoading from "./loading";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";

function Drafts() {
	// const [drafts, setDrafts] = useState<Draft[]>([]);
	const [loadingDrafts, setLoadingDrafts] = useState(false);
	const { documentDb } = useContext(IndexedDbContext);
	const [tagToDraftMap, setTagToDraftMap] = useState(
		new Map<string, { timeStamp: string; markdown: string }[]>()
	);

	// const tagToDraftMap = new Map<
	// 	string,
	// 	{ timeStamp: string; markdown: string }[]
	// >();

	useEffect(() => {
		if (documentDb) {
			setLoadingDrafts(true);
			const mdObjectStore = getMarkdownObjectStore(
				documentDb,
				"readonly"
			);
			const tagsIndex = mdObjectStore.index("tagsIndex");

			const cursorRequest = tagsIndex.openCursor();
			cursorRequest.onsuccess = function (event) {
				const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
					.result;
				if (cursor) {
					const tag = cursor.key;
					setTagToDraftMap((p) => {
						const previousDrafts = p.get(tag as string) || [];
						previousDrafts?.push(cursor.value);
						p.set(tag as string, previousDrafts);
						return p;
					});

					cursor.continue();
				} else {
					console.log(Array.from(tagToDraftMap.keys()));
					setLoadingDrafts(false);
				}
			};
		}
	}, [documentDb]);

	return (
		<>
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
				{!loadingDrafts ? (
					<>
						{tagToDraftMap.size > 0 ? (
							// <DraftsDisplay drafts={drafts} />
							<>
								{Array.from(tagToDraftMap.keys()).map((tag) => {
									if (tag !== "notag")
										return (
											<TaggedDrafts
												tag={tag}
												rawObjects={
													tagToDraftMap.get(
														tag as string
													) || []
												}
											/>
										);
								})}
								<TaggedDrafts
									tag="notag"
									rawObjects={
										tagToDraftMap.get("notag") || []
									}
								/>
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

function TaggedDrafts({
	tag,
	rawObjects,
}: {
	tag: string;
	rawObjects: RawObject[];
}) {
	if (tag === "notag") {
		return (
			<div className="pl-4 border-l-2 border-border ml-1">
				<DraftsDisplay rawObjects={rawObjects} />
			</div>
		);
	}
	return (
		<details>
			<summary className="text-lg font-serif font-bold">{tag}</summary>
			<div className="border-l-2 border-border ml-1 pl-4">
				<DraftsDisplay rawObjects={rawObjects} />
			</div>
		</details>
	);
}

export function DraftsDisplay({ rawObjects }: { rawObjects: RawObject[] }) {
	const drafts = rawObjects.map((r) => rawObjectToDraft(r));
	return (
		<>
			{drafts.map((draft) => {
				return (
					<div
						className="flex flex-col  relative "
						key={draft.timeStamp}
					>
						<SingleDraft draft={draft} />
					</div>
				);
			})}
		</>
	);
}

export function SingleDraft({ draft }: { draft: Draft }) {
	const { title, description } = draft.draftMeta;
	return (
		<div className="flex flex-col group p-2 relative ">
			<DraftActions draft={draft} />
			<Link href={`/draft/${draft.timeStamp}`} className="">
				<PostTitle title={title || ""} description={description} />
				<p className="text-xs text-gray-400 mt-1">
					<span className="">{draft.date}</span>
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
