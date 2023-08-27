import SearchResult from "@/interfaces/SearchResult";
import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import PostOnPreviewColor from "./PostOnPreviewColor";
import { PostActions } from "./PostOptions";
import PostTitle from "./PostTitle";
import { Draft } from "@utils/processDrafts";

export interface PostComponentProps {
	post: Partial<Draft>;
	tag?: string;
}

const PostComponent: React.FC<PostComponentProps> = ({ post, tag }) => {
	const { postId: id, title, description, date, timeStamp, published } = post;

	return (
		<div className="relative">
			<PostActions
				{...{
					published: !!published,
					postId: parseInt(id!),
					postTitle: title!,
					timeStamp,
				}}
			/>
			<Link
				href={
					published
						? `/post/${id}?tagpreview=${tag}`
						: `/post/private/${id}?tagpreview=${tag}`
				}
				className="flex flex-col gap-2 group py-2 first:pt-0 px-2  rounded-md "
			>
				<PostOnPreviewColor postId={parseInt(id!)} tag={tag} />

				<PostTitle
					{...{
						title: title!,
						description: description || undefined,
					}}
				/>
				<div className="flex gap-2 items-center text-xs text-gray-400">
					<span className="">{date && formatDate(date)}</span>
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
