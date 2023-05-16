"use client";
import formatDate from "@utils/dateFormatter";
import { UserContext } from "app/appContext";
import SearchResult from "interfaces/SearchResult";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BiUpvote } from "react-icons/bi";
import { SlOptionsVertical } from "react-icons/sl";
import { TbNews, TbNewsOff } from "react-icons/tb";

export interface PostComponentProps {
	post: Partial<SearchResult>;
	upvotes?: number;
	// author?: string;
	// owner: boolean;
	// setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
}

const PostComponent: React.FC<PostComponentProps> = ({ post, upvotes }) => {
	const {
		id,
		title,
		description,
		created_by,
		published_on,
		published,
		language,
		created_at,
		upvoted_on,
	} = post;
	const pathname = usePathname();
	const formatter = useRef(Intl.NumberFormat("en", { notation: "compact" }));
	const [mounted, setMounted] = useState(false);
	const [owner, setOwner] = useState(false);
	const [showOptions, setShowOptions] = useState(false);
	const { user } = useContext(UserContext);

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, []);

	useEffect(() => {
		setOwner(
			user?.id !== "undefined" &&
				post.bloggers?.id !== "undefined" &&
				user?.id === post.bloggers?.id
		);
	}, [user]);

	return (
		<div className="relative flex flex-col">
			<div className="flex justify-between">
				<Link
					href={`/apppost/${id}`}
					className="text-lg text-black font-semibold hover:italic hover:underline dark:text-white truncate w-3/4"
				>
					{title}{" "}
				</Link>
				{mounted && owner && pathname?.startsWith("/appprofile") && (
					<>
						<button onClick={() => setShowOptions((prev) => !prev)}>
							<SlOptionsVertical size={12} />
						</button>
						{showOptions && (
							<div className="flex absolute text-xs right-4 top-10 divide-x border-2 [&>*]:px-2 [&>*]:py-1 rounded-md">
								{!published && (
									<a
										className="hover:bg-slate-500 flex items-end gap-1"
										href={`/edit?postId=${id}`}
									>
										<AiFillEdit
											className="inline"
											size={15}
										/>{" "}
										Edit
									</a>
								)}
								{published ? (
									<label
										htmlFor={`unpublish`}
										// onClick={onAction}
										className="hover:bg-slate-500 flex items-end gap-1"
									>
										<TbNewsOff
											className="inline"
											size={15}
										/>{" "}
										Unpublish
									</label>
								) : (
									<label
										htmlFor={`publish`}
										// onClick={onAction}
										className="hover:bg-slate-500 flex items-end gap-1"
									>
										<TbNews className="inline" size={15} />
										Publish
									</label>
								)}
								<label
									htmlFor={`delete`}
									// onClick={onAction}
									className="hover:bg-slate-500 flex gap-1 items-end"
								>
									<AiFillDelete
										className="inline"
										size={15}
									/>{" "}
									Delete
								</label>
							</div>
						)}
					</>
					// <div className="flex absolute top-4 right-2 gap-3 text-black dark:text-white">
					// 	{!published && (
					// 	)}

					// </div>
				)}
			</div>

			<p className="text-sm md:text-base text-black dark:text-font-grey font-sans ">
				{description}
			</p>
			<div
				className="flex text-xs text-black/50 dark:text-font-grey mt-1  max-w-full divide-x-2 divide-black/30
			dark:divide-white/40"
			>
				<Link
					href={`/appprofile/${created_by}`}
					className=" underline-offset-2 w-1/3 md:w-1/5 truncate hover:italic underline"
				>
					{post.bloggers?.name || post.author || ""}
				</Link>
				<div className="px-1 w-24  flex justify-center ">
					{upvoted_on ? (
						<span className="flex items-center">
							<BiUpvote /> - {formatDate(upvoted_on)}
						</span>
					) : (
						<span>
							{published && published_on
								? formatDate(published_on)
								: formatDate(created_at!)}
						</span>
					)}
				</div>
				{published && (
					<div className="flex justify-center w-16 ">
						<span className="flex items-center gap-1">
							{upvotes
								? formatter.current.format(upvotes)
								: post.upvote_count
								? post.upvote_count
								: 0}{" "}
							<BiUpvote />
						</span>
					</div>
				)}
				<div
					className={` px-1 font-bold font-mono flex justify-center w-20`}
				>
					<span>{language}</span>
				</div>
			</div>
		</div>
	);
};

export default PostComponent;
