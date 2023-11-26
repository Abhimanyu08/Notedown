import PostWithBlogger from "@/interfaces/PostWithBlogger";
import PostComponent from "./PostComponent";
import { Database } from "@/interfaces/supabase";
import { PostDisplayProps } from "../interfaces/PostDisplayProps";

function PostDisplay({ posts, tag }: PostDisplayProps) {
	return (
		<div className="flex flex-col gap-3">
			{posts.map((post) => (
				<PostComponent key={post.postId} post={post} tag={tag} />
			))}
		</div>
	);
}

export default PostDisplay;
