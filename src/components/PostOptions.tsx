"use client";
import { useSupabase } from "@/app/appContext";
import { sendRevalidationRequest } from "@utils/sendRequest";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { SlOptions } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";
import ActionModal from "./Modals/ActionModal";

export function PostOptions({
	published,
	postId,
	postTitle,
	publishPostAction,
	unpublishPostAction,
}: {
	published: boolean;
	postId: number;
	postTitle: string;
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
}) {
	const pathname = usePathname();
	const { session } = useSupabase();

	const profileId = pathname?.split("/").at(2);
	const owner = profileId === session?.user.id;
	const [isPending, startTransition] = useTransition();

	return (
		<>
			{/* <ActionModal action="delete" postTitle={postTitle} /> */}
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
				{owner && pathname?.startsWith("/appprofile") && (
					<>
						<button className="flex justify-center items-center">
							<SlOptions size={12} />
						</button>
						<div className="flex z-50 absolute text-xs right-0 top-8 gap-3 flex-col bg-gray-800 p-3 w-max rounded-sm invisible group-hover:visible transition-all duration-200">
							{!published && (
								<PostOptionButton>
									<a href={`/appwrite/${postId}`}>
										<AiFillEdit
											className="inline"
											size={15}
										/>{" "}
										<span>Edit</span>
									</a>
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
								<label htmlFor={`delete`}>
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
