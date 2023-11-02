"use client";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import ActionWrapper from "@components/ActionWrapper";
import ActionModal from "@components/Modals/ActionModal";
import { MenubarItem } from "@components/ui/menubar";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { useContext, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { ProfileContext } from "../../../../contexts/ProfileContext";

export function DraftActions({ draft }: { draft: Draft }) {
	const { documentDb } = useContext(IndexedDbContext);
	const { setDraftAndPostMap } = useContext(ProfileContext);
	const [isPending, startTransition] = useTransition();
	const [startDelete, setStartDelete] = useState(false);

	const deleteDraft = (timeStamp: string) => {
		if (!documentDb) throw new Error("No indexed database present");
		const mdObjectStore = getMarkdownObjectStore(documentDb);

		const deleteRequest = mdObjectStore.delete(timeStamp);
		deleteRequest.onsuccess = () => {
			setDraftAndPostMap((p) => {
				const newMap = new Map(p);
				if (!draft.tags || draft.tags.length === 0) {
					const noTagEntities = newMap.get("notag");
					noTagEntities!.drafts =
						noTagEntities?.drafts.filter(
							(d) => d.timeStamp !== draft.timeStamp
						) || [];

					newMap.set("notag", noTagEntities!);
					return newMap;
				}
				for (let tag of draft.tags) {
					const tagEntities = newMap.get(tag);
					tagEntities!.drafts =
						tagEntities?.drafts.filter(
							(d) => d.timeStamp !== draft.timeStamp
						) || [];

					newMap.set(tag, tagEntities!);
				}
				return newMap;
			});
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
