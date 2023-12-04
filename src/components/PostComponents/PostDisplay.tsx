import { PostDisplayProps } from "../../interfaces/PostDisplayProps";
import Post from "./PostComponent";

function PostDisplay({ posts, tag }: PostDisplayProps) {
	return (
		<div className="flex flex-col gap-3">
			{posts.map((post) => (
				<Post key={post.postId} post={post} tag={tag} />
			))}
		</div>
	);
}

export default PostDisplay;
