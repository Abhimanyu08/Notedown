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
	const pathname = usePathname();
	const owner = useOwner();
	const [takenAction, setTakenAction] = useState<
		"published" | "deleted" | "unpublished" | ""
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
				postId={postId}
				onAction={() => {
					startTransition(() => {
						setTakenAction("deleted");
						if (deletePostAction) deletePostAction(postId);
					});
				}}
			/>
			<ActionModal
				action="publish"
				postId={postId}
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						setTakenAction("published");
						if (publishPostAction) publishPostAction(postId);
					});
				}}
			/>
			<ActionModal
				action="unpublish"
				postId={postId}
				postTitle={postTitle}
				isActionPending={isPending}
				onAction={() => {
					startTransition(() => {
						setTakenAction("unpublished");
						if (unpublishPostAction) unpublishPostAction(postId);
					});
				}}
			/>
			<div className="absolute z-40 right-0 top-2 rounded-full p-2 hover:bg-gray-800 group/options">
				{owner && (
					<>
						<button className="flex justify-center items-center">
							<SlOptions size={12} />
						</button>
						<div className="flex z-50 absolute text-xs right-0 top-8 gap-3 flex-col bg-gray-800 p-3 w-max rounded-sm invisible group-hover/options:visible group-focus/options:visible transition-all duration-200">
							<PostOptionButton>
								<Link
									href={`/write/${postId}`}
									prefetch={false}
								>
									<AiFillEdit className="inline" size={15} />{" "}
									<span>Edit</span>
								</Link>
							</PostOptionButton>
							{published ? (
								<PostOptionButton>
									<label htmlFor={`unpublish-${postId}`}>
										<TbNewsOff
											className="inline"
											size={15}
										/>{" "}
										<span>Unpublish</span>
									</label>
								</PostOptionButton>
							) : (
								<PostOptionButton>
									<label htmlFor={`publish-${postId}`}>
										<TbNews className="inline" size={15} />
										<span>Publish</span>
									</label>
								</PostOptionButton>
							)}
							<PostOptionButton>
								<label htmlFor={`delete-${postId}`}>
									<AiFillDelete
										className="inline"
										size={15}
									/>{" "}
									Delete
								</label>
							</PostOptionButton>
						</div>
					</>
				)}
			</div>
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
			className="text-xs cursor-pointer  rounded-sm w-full [&>*]:flex [&>*]:justify-start [&>*]:gap-1"
			onClick={onClick}
		>
			{children}
		</button>
	);
};
