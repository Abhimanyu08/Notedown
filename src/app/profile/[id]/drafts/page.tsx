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
import { Draft, processDrafts } from "@utils/processDrafts";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import PostsLoading from "../loading";

function Drafts() {
	const [drafts, setDrafts] = useState<Draft[]>([]);
	const [loadingDrafts, setLoadingDrafts] = useState(false);
	const { documentDb } = useContext(IndexedDbContext);

	useEffect(() => {
		if (documentDb) {
			setLoadingDrafts(true);
			processDrafts(documentDb).then((drafts) => {
				setDrafts(drafts);
				setLoadingDrafts(false);
			});
		}
	}, [documentDb]);

	return (
		<>
			<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
				{!loadingDrafts ? (
					<>
						{drafts.length > 0 ? (
							<DraftsDisplay drafts={drafts} />
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

export function DraftsDisplay({ drafts }: { drafts: Draft[] }) {
	return (
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
	);
}

export function SingleDraft({ draft }: { draft: Draft }) {
	const { title, description } = draft.draftMeta;
	return (
		<div className="flex flex-col group p-2 relative">
			<DraftActions draft={draft} />
			<Link href={`/draft/${draft.timeStamp}`} className="">
				<PostTitle title={title || ""} description={description} />
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
