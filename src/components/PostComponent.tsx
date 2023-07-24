import SearchResult from "@/interfaces/SearchResult";
import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import PostOnPreviewColor from "./PostOnPreviewColor";
import { PostOptions } from "./PostOptions";
import PostTitle from "./PostTitle";

export interface PostComponentProps {
	post: Partial<SearchResult>;
}

const PostComponent: React.FC<PostComponentProps> = ({ post }) => {
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
				}}
			/>
			<Link
				href={published ? `/post/${id}` : `/post/private/${id}`}
				className="flex flex-col gap-2 group py-2 first:pt-0 px-2  rounded-md "
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
