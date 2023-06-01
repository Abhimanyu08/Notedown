"use client";
import { useSupabase } from "@/app/appContext";
import { sendRevalidationRequest } from "@utils/sendRequest";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";

export function PostOptions({
	published,
	postId,
	publishPostAction,
	unpublishPostAction,
}: {
	published: boolean;
	postId: number;
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
}) {
	const pathname = usePathname();
	const { session } = useSupabase();

	const profileId = pathname?.split("/").at(2);
	const owner = profileId === session?.user.id;
	const [isPending, startTransition] = useTransition();

	return (
		<div className="absolute right-0 top-2 rounded-full p-2 hover:bg-gray-800 group">
			{owner && pathname?.startsWith("/appprofile") && (
				<>
					<button>
						<SlOptions size={12} />
					</button>
					<div className="flex z-50 absolute text-xs right-0 top-8 gap-3 flex-col bg-gray-800 p-3 w-max rounded-sm invisible group-hover:visible transition-all duration-200">
						{!published && (
							<PostOptionButton>
								<a href={`/appwrite/${postId}`}>
									<AiFillEdit className="inline" size={15} />{" "}
									<span>Edit</span>
								</a>
							</PostOptionButton>
						)}
						{published ? (
							<PostOptionButton
								onClick={() => {
									startTransition(() => {
										if (unpublishPostAction)
											unpublishPostAction(postId);
									});
								}}
							>
								<div className="">
									<TbNewsOff className="inline" size={15} />{" "}
									<span>Unpublish</span>
								</div>
							</PostOptionButton>
						) : (
							<PostOptionButton
								onClick={() => {
									startTransition(() => {
										if (publishPostAction)
											publishPostAction(postId);
									});
								}}
							>
								<div className="">
									<TbNews className="inline" size={15} />
									<span>
										{isPending ? "Publishing" : "Publish"}
									</span>
								</div>
							</PostOptionButton>
						)}
						<PostOptionButton>
							<label htmlFor={`delete`}>
								<AiFillDelete className="inline" size={15} />{" "}
								Delete
							</label>
						</PostOptionButton>
					</div>
				</>
			)}
		</div>
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
			className="text-xs cursor-pointer  rounded-sm w-full mx-auto [&>*]:flex [&>*]:justify-start [&>*]:gap-1"
			onClick={onClick}
		>
			{children}
		</button>
	);
};
