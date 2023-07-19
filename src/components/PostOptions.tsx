"use client";
import { useSupabase } from "@/app/appContext";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";
import ActionModal from "./Modals/ActionModal";
import Link from "next/link";
import useOwner from "@/hooks/useOwner";
import { ToastContext } from "@/contexts/ToastProvider";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";

export function PostOptions({
	published,
	postId,
	postTitle,
	publishPostAction,
	unpublishPostAction,
	deletePostAction,
}: {
	published: boolean;
	postId: number;
	postTitle: string;
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
	deletePostAction?: (postId: number) => Promise<void>;
}) {
	const owner = useOwner();
	const [takenAction, setTakenAction] = useState<
		"publish" | "delete" | "unpublish" | ""
	>("");
	const [isPending, startTransition] = useTransition();
	const context = useContext(ToastContext);

	useEffect(() => {
		if (!isPending && takenAction) {
			context?.setMessage(`${postTitle} ${takenAction}`);
		}
	}, [isPending]);

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
						<MenubarContent className="min-w-0">
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
							{published ? (
								<MenubarItem
									onClick={() => setTakenAction("unpublish")}
								>
									<TbNewsOff className="inline" size={15} />{" "}
									<span>Unpublish</span>
								</MenubarItem>
							) : (
								<MenubarItem
									onClick={() => setTakenAction("publish")}
								>
									<TbNews className="inline" size={15} />
									<span>Publish</span>
								</MenubarItem>
							)}
							<MenubarItem
								onClick={() => setTakenAction("delete")}
							>
								<AiFillDelete className="inline" size={15} />{" "}
								Delete
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			)}
		</>
	);
}

const PostOptionButton = ({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick?: React.MouseEventHandler;
}) => {
	return (
		<button
			className="text-xs cursor-pointer rounded-sm w-full [&>*]:flex [&>*]:justify-start [&>*]:gap-1"
			onClick={onClick}
		>
			{children}
		</button>
	);
};
