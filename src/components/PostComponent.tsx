import SearchResult from "@/interfaces/SearchResult";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import { BiUpvote } from "react-icons/bi";
import { PostOptions } from "./PostOptions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

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
		<div className="relative flex flex-col gap-1">
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
			<HoverCard>
				<HoverCardTrigger>
					<Link
						href={published ? `/post/${id}` : `/post/private/${id}`}
						className="text-lg text-black font-semibold hover:italic font-serif hover:underline dark:text-gray-200 break-words w-3/4"
					>
						{title}{" "}
					</Link>
				</HoverCardTrigger>
				<HoverCardContent className="bg-slate-800">
					{description}
				</HoverCardContent>
			</HoverCard>

			{/* <p className="text-sm md:text-base text-black dark:text-gray-400 ">
				{description}
			</p> */}
			<div className="flex text-xs text-black/50 dark:text-gray-400 mt-1 gap-4  max-w-full ">
				{/* <BlogAuthor
					createdBy={created_by!}
					className=" underline-offset-2 w-1/3 md:w-1/5 truncate hover:italic flex-initialu"
				/> */}
				<div className="">
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
		</div>
	);
};

export default PostComponent;
