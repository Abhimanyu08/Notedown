import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import PostOnPreviewColor from "../PostComponents/PostOnPreviewColor";
import { PostActions } from "../PostComponents/PostOptions";
import PostTitle from "../PostComponents/PostTitle";
import { Draft } from "@utils/processDrafts";
import OwnerOnlyStuff from "@components/ProfileComponents/OwnerOnlyStuff";

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
		created_by,
	} = post;

	return (
		<div className="relative">
			<PostActions
				{...{
					published: !!published,
					postId: parseInt(id!),
					postTitle: title!,
					timeStamp,
					slug,
				}}
			/>
			<Link
				href={`/notebook/${created_by}?note=${slug || id}&tag=${tag}`}
				className="flex flex-col gap-2 group py-2 first:pt-0 px-2  rounded-md "
			>
				<PostOnPreviewColor
					postId={parseInt(id!)}
					tag={tag}
					slug={slug}
				/>

				<PostTitle
					{...{
						title: title!,
						description: description || undefined,
					}}
				/>
				<div className="flex gap-2 items-center text-xs text-gray-400">
					<span className="">{date && formatDate(date)}</span>
					<OwnerOnlyStuff id={created_by!}>
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
					</OwnerOnlyStuff>
				</div>
			</Link>
		</div>
	);
};

export default Post;
