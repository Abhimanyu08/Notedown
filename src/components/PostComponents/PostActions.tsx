"use client";
import {
	deletePostAction,
	publishPostAction,
	unpublishPostAction,
} from "@/app/actions";
import { MenubarItem } from "@/components/ui/menubar";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { IoMdShareAlt } from "react-icons/io";
import { TbNews, TbNewsOff } from "react-icons/tb";
import { IndexedDbContext } from "../../contexts/IndexedDbContext";
import ActionWrapper from "../ActionWrapper";
import ActionModal from "../Modals/ActionModal";
import { useToast } from "../ui/use-toast";
import modifyDraftAndPostLink from "@utils/modifyDraftAndPostLink";

export function PostActions({
	published,
	postId,
	postTitle,
	tag,
	timeStamp,
	slug,
}: {
	published: boolean;
	postId: number;
	postTitle: string;
	tag: string;
	timeStamp?: string;
	slug?: string;
}) {
	const [takenAction, setTakenAction] = useState<
		"publish" | "delete" | "unpublish" | ""
	>("");
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { documentDb } = useContext(IndexedDbContext);
	const { toast } = useToast();
	let href = pathname + `?note=${slug || postId}`;

	href = modifyDraftAndPostLink(href, searchParams, tag);

	return (
		<>
			<ActionModal
				action="delete"
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						if (documentDb && timeStamp) {
							removePostIdFromDraftObject(
								documentDb,
								timeStamp
							).then(() => {
								if (deletePostAction) deletePostAction(postId);
								setTakenAction("");
							});
							return;
						}
						if (deletePostAction) deletePostAction(postId);
						setTakenAction("");
					});
				}}
				visible={takenAction === "delete"}
				onClose={() => setTakenAction("")}
				type="post"
			/>
			<ActionModal
				action="publish"
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						if (publishPostAction) publishPostAction(postId);
						setTakenAction("");
					});
				}}
				visible={takenAction === "publish"}
				onClose={() => setTakenAction("")}
			/>
			<ActionModal
				action="unpublish"
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						if (unpublishPostAction) unpublishPostAction(postId);
						setTakenAction("");
					});
				}}
				visible={takenAction === "unpublish"}
				onClose={() => setTakenAction("")}
			/>
			<ActionWrapper href={href}>
				<MenubarItem className="">
					<Link
						href={
							timeStamp
								? `/write/${postId}?draft=${timeStamp}`
								: `/write/${postId}`
						}
						prefetch={false}
						className="flex gap-2 items-center"
					>
						<AiFillEdit className="inline" size={15} />{" "}
						<span>Edit</span>
					</Link>
				</MenubarItem>
				<>
					{published ? (
						<>
							<MenubarItem
								onClick={() => setTakenAction("unpublish")}
							>
								<TbNewsOff className="inline" size={15} />{" "}
								<span>Unpublish</span>
							</MenubarItem>

							<MenubarItem
								onClick={() => {
									navigator.clipboard.writeText(
										window.location.origin +
											"/note/" +
											(slug || postId)
									);
									toast({
										title: "Link copied!!",
										duration: 2000,
									});
								}}
							>
								<IoMdShareAlt className="inline" size={15} />{" "}
								<span>Share</span>
							</MenubarItem>
						</>
					) : (
						<MenubarItem onClick={() => setTakenAction("publish")}>
							<TbNews className="inline" size={15} />
							<span>Publish</span>
						</MenubarItem>
					)}
					<MenubarItem onClick={() => setTakenAction("delete")}>
						<AiFillDelete className="inline" size={15} /> Delete
					</MenubarItem>
				</>
			</ActionWrapper>
		</>
	);
}
function removePostIdFromDraftObject(
	db: IDBDatabase,
	key: string
): Promise<void> {
	const mdObjectStore = getMarkdownObjectStore(db);

	const mdReq = mdObjectStore.get(key);

	return new Promise((res) => {
		mdReq.onsuccess = () => {
			const previousData = mdReq.result;
			delete previousData["postId"];
			mdObjectStore.put(previousData);
			res();
		};
	});
}
