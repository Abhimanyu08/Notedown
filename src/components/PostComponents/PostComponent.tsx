import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import { Draft } from "@utils/processDrafts";
import PostTitle from "../PostComponents/PostTitle";
import { PostActions } from "./PostActions";
import PostLink from "./PostLink";

export interface PostComponentProps {
	post: Partial<Draft>;
	tag?: string;
}

const Post: React.FC<PostComponentProps> = ({ post, tag }) => {
	const {
		postId: id,
		title,
		description,
		date,
		timeStamp,
		published,
		slug,
	} = post;

	return (
		<div className="relative">
			<PostActions
				{...{
					published: !!published,
					postId: id!,
					postTitle: title!,
					timeStamp,
					slug,
					tag: tag!,
				}}
			/>
			<PostLink
				className="flex flex-col gap-2 group py-2 first:pt-0 px-2  rounded-md "
				slug={slug}
				tag={tag}
				id={id}
			>
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
							"rounded-lg px-1  underline underline-offset-2",
							published
								? "decoration-emerald-700"
								: "decoration-rose-700"
						)}
					>
						{published ? "public" : "private"}
					</span>
				</div>
			</PostLink>
		</div>
	);
};

export default Post;
