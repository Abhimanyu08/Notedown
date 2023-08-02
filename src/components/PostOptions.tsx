"use client";
import {
	deletePostAction,
	publishPostAction,
	unpublishPostAction,
} from "@/app/actions";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@/components/ui/menubar";
import useOwner from "@/hooks/useOwner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";
import ActionModal from "./Modals/ActionModal";

export function PostOptions({
	published,
	postId,
	postTitle,
}: {
	published: boolean;
	postId: number;
	postTitle: string;
}) {
	const owner = useOwner();
	const [takenAction, setTakenAction] = useState<
		"publish" | "delete" | "unpublish" | ""
	>("");
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();

	return (
		<>
			<ActionModal
				action="delete"
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						if (deletePostAction) deletePostAction(postId);
						setTakenAction("");
					});
				}}
				visible={takenAction === "delete"}
				onClose={() => setTakenAction("")}
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
			{owner && (
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
									href={`/write/${postId}`}
									prefetch={false}
									className="flex gap-2 items-center"
								>
									<AiFillEdit className="inline" size={15} />{" "}
									<span>Edit</span>
								</Link>
							</MenubarItem>
							{!pathname?.includes("post") && (
								<>
									{published ? (
										<MenubarItem
											onClick={() =>
												setTakenAction("unpublish")
											}
										>
											<TbNewsOff
												className="inline"
												size={15}
											/>{" "}
											<span>Unpublish</span>
										</MenubarItem>
									) : (
										<MenubarItem
											onClick={() =>
												setTakenAction("publish")
											}
										>
											<TbNews
												className="inline"
												size={15}
											/>
											<span>Publish</span>
										</MenubarItem>
									)}
									<MenubarItem
										onClick={() => setTakenAction("delete")}
									>
										<AiFillDelete
											className="inline"
											size={15}
										/>{" "}
										Delete
									</MenubarItem>
								</>
							)}
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			)}
		</>
	);
}
