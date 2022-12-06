import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BiUpvote } from "react-icons/bi";
import { TbNews, TbNewsOff } from "react-icons/tb";
import { ALLOWED_LANGUAGES } from "../../utils/constants";
import formatDate from "../../utils/dateFormatter";
import { PostComponentProps } from "../interfaces/PostComponentProps";

const langToBadgeColor: Record<typeof ALLOWED_LANGUAGES[number], string> = {
	javascript: "dark:text-amber-500 text-stone-500",
	python: "text-green-500",
	rust: "text-red-500",
};

const PostComponent: React.FC<PostComponentProps> = ({
	post,
	author,
	owner = false,
	setPostInAction,
}) => {
	const {
		id,
		title,
		description,
		created_by,
		published_on,
		published,
		upvote_count: upvotes,
		language,
		created_at,
		upvoted_on,
	} = post;
	const router = useRouter();
	const formatter = useRef(Intl.NumberFormat("en", { notation: "compact" }));
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, []);
	const onAction: MouseEventHandler = () => {
		if (setPostInAction) setPostInAction(post);
	};
	return (
		<div className="relative container bg-cyan-200 dark:bg-black lg:p-4 p-2 rounded-md shadow-md shadow-black dark:shadow-white">
			<Link
				href={
					published ? `/posts/${id}` : `/posts/preview?postId=${id}`
				}
			>
				<div className="text-lg text-purple-700 md:text-xl dark:text-amber-400 font-extrabold font-mono link link-hover truncate w-3/4">
					{title}{" "}
				</div>
			</Link>
			{owner && mounted && router.asPath.startsWith("/profile") && (
				<div className="flex absolute top-0 right-2 gap-3 text-black">
					{!published && (
						<label
							className="md:tooltip md:tooltip-left capitalize"
							data-tip="edit"
							onClick={() => router.push(`/edit?postId=${id}`)}
						>
							<AiFillEdit className="ml-1 mt-1 " size={15} />
						</label>
					)}
					{published ? (
						<label
							htmlFor={`unpublish`}
							className="md:tooltip md:tooltip-left capitalize"
							data-tip="unpublish"
							onClick={onAction}
						>
							<TbNewsOff className="ml-1 mt-1 " size={15} />
						</label>
					) : (
						<label
							htmlFor={`publish`}
							className="md:tooltip-left md:tooltip capitalize"
							data-tip="publish"
							onClick={onAction}
						>
							<TbNews className="ml-1 mt-1 " size={15} />
						</label>
					)}
					<label
						htmlFor={`delete`}
						className="md:tooltip md:tooltip-left capitalize"
						data-tip="delete"
						onClick={onAction}
					>
						<AiFillDelete className="ml-1 mt-1 " size={15} />
					</label>
				</div>
			)}

			<div
				className="flex text-xs text-black/50 dark:text-white/60 mt-1 mb-1 max-w-full divide-x-2 divide-black/30
			dark:divide-white/40"
			>
				<Link href={`/profile/${created_by}`}>
					<p className="link underline-offset-2 w-1/3 md:w-1/5 truncate">
						{author}
					</p>
				</Link>
				<div className="px-1 w-24  flex justify-center ">
					{upvoted_on ? (
						<span className="flex items-center">
							<BiUpvote /> - {formatDate(upvoted_on)}
						</span>
					) : (
						<span>
							{published && published_on
								? new Date(published_on).toDateString().slice(4)
								: new Date(created_at!).toDateString().slice(4)}
						</span>
					)}
				</div>
				{published && (
					<div className="flex justify-center w-16 ">
						<span className="flex items-center gap-1">
							{upvotes &&
								upvotes > 0 &&
								formatter.current.format(upvotes)}{" "}
							<BiUpvote />
						</span>
					</div>
				)}
				<div
					className={`${
						language && langToBadgeColor[language]
					} px-1 font-bold  flex justify-center w-20`}
				>
					<span>{language}</span>
				</div>
			</div>
			<p className="text-sm md:text-base text-black dark:text-white font-sans mt-2">
				{description}
			</p>
		</div>
	);
};

export default PostComponent;
