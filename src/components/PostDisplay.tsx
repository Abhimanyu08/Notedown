import { getUpvotes } from "@/app/utils/getData";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import PostComponent from "./PostComponent";

interface PostDisplayProps {
	posts: PostWithBlogger[];
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
	deletePostAction?: (postId: number) => Promise<void>;
}

async function PostDisplay({
	posts,
	publishPostAction,
	unpublishPostAction,
	deletePostAction,
}: PostDisplayProps) {
	const idArray = posts?.map((post) => post.id!);
	let idToUpvotes: Record<number, number> = {};
	if (idArray) {
		const data = await getUpvotes(idArray);
		if (data) {
			data.forEach((post) => {
				idToUpvotes[post.id] = post.upvote_count;
			});
		}
	}

	return (
		<>
			{(posts?.length || 0) > 0 ? (
				<div className="flex flex-col gap-8">
					{posts?.map((post) => (
						<PostComponent
							key={post.id}
							post={post}
							upvotes={idToUpvotes[post.id!]}
							{...{
								publishPostAction,
								unpublishPostAction,
								deletePostAction,
							}}
						/>
					))}
				</div>
			) : (
				<p className="self-center mt-10 text-white/70">No Posts yet</p>
			)}
		</>
	);
}

export default PostDisplay;
