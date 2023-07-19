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
		<div className="relative">
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
				className="flex flex-col gap-3 group py-2 first:pt-0 px-2  rounded-md "
			>
				<PostOnPreviewColor postId={id!} />

				<PostTitle
					{...{
						title: title!,
						description: description || undefined,
					}}
				/>
				<div className="flex gap-2 items-center text-xs text-gray-400">
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
			</Link>
		</div>
	);
};

export default PostComponent;
