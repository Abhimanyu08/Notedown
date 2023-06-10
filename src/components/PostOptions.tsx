"use client";
import { useSupabase } from "@/app/appContext";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";
import ActionModal from "./Modals/ActionModal";
import Link from "next/link";
import useOwner from "@/hooks/useOwner";

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
	const [isPending, startTransition] = useTransition();

	return (
		<>
			<ActionModal
				action="delete"
				postTitle={postTitle}
				isActionPending={isPending}
				postId={postId}
				onAction={() => {
					startTransition(() => {
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
						if (unpublishPostAction) unpublishPostAction(postId);
					});
				}}
			/>
			<div className="absolute right-0 top-2 rounded-full p-2 hover:bg-gray-800 group">
				{owner && pathname?.startsWith("/profile") && (
					<>
						<button className="flex justify-center items-center">
							<SlOptions size={12} />
						</button>
						<div className="flex z-50 absolute text-xs right-0 top-8 gap-3 flex-col bg-gray-800 p-3 w-max rounded-sm invisible group-hover:visible group-focus:visible transition-all duration-200">
							{!published && (
								<PostOptionButton>
									<Link
										href={`/write/${postId}`}
										prefetch={false}
									>
										<AiFillEdit
											className="inline"
											size={15}
										/>{" "}
										<span>Edit</span>
									</Link>
								</PostOptionButton>
							)}
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
