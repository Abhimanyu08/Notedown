import SearchResult from "@/interfaces/SearchResult";
import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import PostOnPreviewColor from "./PostOnPreviewColor";
import { PostOptions } from "./PostOptions";
import PostTitle from "./PostTitle";
import { Draft } from "@utils/processDrafts";

export interface PostComponentProps {
	post: Partial<Draft>;
}

const PostComponent: React.FC<PostComponentProps> = ({ post }) => {
	const { postId: id, title, description, date, timeStamp, published } = post;

	return (
		<div className="relative">
			<PostOptions
				{...{
					published: !!published,
					postId: parseInt(id!),
					postTitle: title!,
					timeStamp,
				}}
			/>
			<Link
				href={published ? `/post/${id}` : `/post/private/${id}`}
				className="flex flex-col gap-2 group py-2 first:pt-0 px-2  rounded-md "
			>
				<PostOnPreviewColor postId={parseInt(id!)} />

				<PostTitle
					{...{
						title: title!,
						description: description || undefined,
					}}
				/>
				<div className="flex gap-2 items-center text-xs text-gray-400">
					<p className="text-xs text-gray-400 mt-1">
						<span className="">{date && formatDate(date)}</span>
					</p>
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
