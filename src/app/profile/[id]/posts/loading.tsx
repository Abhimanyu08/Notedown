import { SinglePostLoading } from "./components/SinglePostLoading";

function PostsLoading() {
	return (
		<div className="flex flex-col gap-10">
			{Array.from({ length: 4 }).map((_, i) => (
				<SinglePostLoading key={i} />
			))}
		</div>
	);
}

export default PostsLoading;
