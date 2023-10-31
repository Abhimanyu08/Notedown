"use client";
import ActionWrapper from "@components/ActionWrapper";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { MenubarItem } from "@components/ui/menubar";
import {
	getMarkdownObjectStore,
	getMarkdownObjectStoreTransaction,
} from "@utils/indexDbFuncs";
import { Draft } from "@utils/processDrafts";
import { sendRevalidationRequest } from "@utils/sendRequest";
import Link from "next/link";
import { useContext, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { ProfileContext } from "./ProfileContext";
import ActionModal from "@components/Modals/ActionModal";

export function DraftActions({ draft }: { draft: Draft }) {
	const { documentDb } = useContext(IndexedDbContext);
	const { setLoadDrafts } = useContext(ProfileContext);
	const [isPending, startTransition] = useTransition();
	const [startDelete, setStartDelete] = useState(false);

	const deleteDraft = (timeStamp: string) => {
		if (!documentDb) throw new Error("No indexed database present");
		const mdObjectStore = getMarkdownObjectStore(documentDb);

		const deleteRequest = mdObjectStore.delete(timeStamp);
		deleteRequest.onsuccess = () => {
			setLoadDrafts(true);
		};
	};

	return (
		<>
			<ActionModal
				action="delete"
				isActionPending={isPending}
				onAction={() =>
					startTransition(() => {
						deleteDraft(draft.timeStamp);
					})
				}
				onClose={() => setStartDelete(false)}
				postTitle={draft.title || ""}
				visible={startDelete}
				key={draft.timeStamp}
				type="draft"
			/>
			<ActionWrapper>
				<MenubarItem className="">
					<Link
						href={`/write?draft=${draft.timeStamp}`}
						prefetch={false}
						className="flex gap-2 items-center"
					>
						<AiFillEdit className="inline" size={15} />{" "}
						<span>Edit</span>
					</Link>
				</MenubarItem>

				<MenubarItem onClick={() => setStartDelete(true)}>
					<AiFillDelete className="inline" size={15} /> Delete
				</MenubarItem>
			</ActionWrapper>
		</>
	);
}
