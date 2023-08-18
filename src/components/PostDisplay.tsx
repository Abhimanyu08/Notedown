import PostWithBlogger from "@/interfaces/PostWithBlogger";
import PostComponent from "./PostComponent";
import { Database } from "@/interfaces/supabase";
import { Draft } from "@utils/processDrafts";

interface PostDisplayProps {
	posts: Draft[];
}

function PostDisplay({ posts }: PostDisplayProps) {
	return (
		<div className="flex flex-col gap-3">
			{posts.map((post) => (
				<PostComponent key={post.postId} post={post} />
			))}
		</div>
	);
}

export default PostDisplay;
