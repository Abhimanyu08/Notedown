import { SinglePostLoading } from "../../../components/ProfileComponents/SinglePostLoading";

function PostsLoading({ numPosts = 4 }: { numPosts?: number }) {
	return (
		<div className="flex flex-col gap-10 px-4">
			{Array.from({ length: numPosts }).map((_, i) => (
				<SinglePostLoading key={i} />
			))}
		</div>
	);
}

export default PostsLoading;
