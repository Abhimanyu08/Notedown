import { cn } from "@/lib/utils";
import formatDate from "@utils/dateFormatter";
import Link from "next/link";
import PostOnPreviewColor from "./PostOnPreviewColor";
import { PostActions } from "./PostOptions";
import PostTitle from "./PostTitle";
import { Draft } from "@utils/processDrafts";
import OwnerOnlyStuff, {
	NotOwnerOnlyStuff,
} from "./ProfileComponents/OwnerOnlyStuff";

export interface PostComponentProps {
	post: Partial<Draft>;
	tag?: string;
}

const PostComponent: React.FC<PostComponentProps> = ({ post, tag }) => {
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
				href={
					published
						? slug
							? `/note/${slug}?tagpreview=${tag}`
							: `/note/${id}?tagpreview=${tag}`
						: slug
						? `/note/private/${slug}?tagpreview=${tag}`
						: `/note/private/${id}?tagpreview=${tag}`
				}
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

export default PostComponent;
