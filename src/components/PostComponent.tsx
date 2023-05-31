"use client";
import SearchResult from "@/interfaces/SearchResult";
import formatDate from "@utils/dateFormatter";
import { useSupabase } from "@/app/AppContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BiUpvote } from "react-icons/bi";
import { SlOptions, SlOptionsVertical } from "react-icons/sl";
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
	const formatter = useRef(Intl.NumberFormat("en", { notation: "compact" }));
	const [mounted, setMounted] = useState(false);
	const [owner, setOwner] = useState(false);
	const [showOptions, setShowOptions] = useState(false);
	const { session } = useSupabase();
	const user = session?.user;

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, []);

	useEffect(() => {
		setOwner(
			user?.id !== "undefined" &&
				(post.bloggers as { id: string; name: string }).id !==
					"undefined" &&
				user?.id === (post.bloggers as { id: string; name: string }).id
		);
	}, [user]);

	return (
		<div className="relative flex flex-col">
			<PostOptions {...{ published: !!published, postId: post.id! }} />
			<Link
				href={`/apppost/${id}`}
				className="text-lg text-black font-semibold hover:italic hover:underline dark:text-white truncate w-3/4"
				// prefetch={false}
			>
				{title}{" "}
			</Link>

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
					{(post.bloggers as { id: string; name: string }).name ||
						post.author ||
						""}
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

const PostOptions = ({
	published,
	postId,
}: {
	published: boolean;
	postId: number;
}) => {
	const pathname = usePathname();
	const { session } = useSupabase();

	const profileId = pathname?.split("/").at(2);
	const owner = profileId === session?.user.id;

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
							<PostOptionButton>
								<label
									htmlFor={`unpublish`}
									className="flex gap-1"
									// onClick={onAction}
								>
									<TbNewsOff className="inline" size={15} />{" "}
									<span>Unpublish</span>
								</label>
							</PostOptionButton>
						) : (
							<PostOptionButton>
								<label
									htmlFor={`publish`}
									// onClick={onAction}
								>
									<TbNews className="inline" size={15} />
									Publish
								</label>
							</PostOptionButton>
						)}
						<PostOptionButton>
							<label
								htmlFor={`delete`}
								// onClick={onAction}
								// className="flex justify-start w-full gap-1"
							>
								<AiFillDelete className="inline" size={15} />{" "}
								Delete
							</label>
						</PostOptionButton>
					</div>
				</>
			)}
		</div>
	);
};

const PostOptionButton = ({ children }: { children: React.ReactNode }) => {
	return (
		<button className="text-xs cursor-pointer  rounded-sm w-full mx-auto [&>*]:flex [&>*]:justify-start [&>*]:gap-1">
			{children}
		</button>
	);
};
export default PostComponent;
