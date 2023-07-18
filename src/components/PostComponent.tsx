import SearchResult from "@/interfaces/SearchResult";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import { BiUpvote } from "react-icons/bi";
import { PostOptions } from "./PostOptions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import PostTitle from "./PostTitle";
import PostOnPreviewColor from "./PostOnPreviewColor";
import { cn } from "@/lib/utils";

export interface PostComponentProps {
	post: Partial<SearchResult>;
	upvotes?: number;
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
	deletePostAction?: (postId: number) => Promise<void>;
}

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
		<Link
			href={published ? `/post/${id}` : `/post/private/${id}`}
			className="relative flex flex-col gap-1 group py-2 first:pt-0 px-2  rounded-md"
		>
			<PostOnPreviewColor postId={id!} />
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

			{/* <p className="text-sm md:text-base text-black dark:text-gray-400 ">
				{description}
			</p> */}
			<div className="flex text-xs text-black/50 dark:text-gray-400 mt-1 gap-3  max-w-full flex-col">
				{/* <BlogAuthor
					createdBy={created_by!}
					className=" underline-offset-2 w-1/3 md:w-1/5 truncate hover:italic flex-initialu"
				/> */}
				<PostTitle
					{...{
						title: title!,
						description: description || undefined,
					}}
				/>
				<div className="flex gap-2">
					<span>
						{published && published_on
							? `published on ${formatDate(published_on)}`
							: `created on ${formatDate(created_at!)}`}
					</span>
					<span
						className={cn(
							"rounded-lg px-1 text-xs underline underline-offset-2",
							published
								? "decoration-emerald-700"
								: "decoration-rose-700"
						)}
					>
						{published ? "public" : "private"}
					</span>
				</div>

				{/* {published && (
					<div className="flex justify-center pl-2 pr-0">
						<span className="flex items-center gap-1 justify-center">
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
					className={` px-1 font-bold font-mono flex justify-start w-20`}
				>
					<span>{language}</span>
				</div> */}
			</div>
		</Link>
	);
};

export default PostComponent;
