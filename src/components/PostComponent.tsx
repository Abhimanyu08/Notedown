import SearchResult from "@/interfaces/SearchResult";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import { BiUpvote } from "react-icons/bi";
import { PostOptions } from "./PostOptions";

export interface PostComponentProps {
	post: Partial<SearchResult>;
	upvotes?: number;
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
	deletePostAction?: (postId: number) => Promise<void>;
}

const formatter = Intl.NumberFormat("en", { notation: "compact" });

const PostComponent: React.FC<PostComponentProps> = ({
	post,
	upvotes,
	publishPostAction,
	unpublishPostAction,
	deletePostAction,
}) => {
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

	return (
		<div className="relative flex flex-col">
			<PostOptions
				{...{
					published: !!published,
					postId: id!,
					postTitle: title!,
					publishPostAction,
					unpublishPostAction,
					deletePostAction,
				}}
			/>
			<Link
				href={published ? `/post/${id}` : `/post/private/${id}`}
				className="text-lg text-black font-semibold hover:italic hover:underline dark:text-white truncate w-3/4"
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
					href={`/profile/${created_by}`}
					className=" underline-offset-2 w-1/3 md:w-1/5 truncate hover:italic underline"
				>
					{(post.bloggers as { id: string; name: string })?.name ||
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
								? formatter.format(upvotes)
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
