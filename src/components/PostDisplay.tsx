import {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import Post from "../interfaces/Post";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import PostComponent from "./PostComponent";

interface PostDisplayProps {
	owner: boolean;
	author?: string;
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
	posts: Partial<PostWithBlogger>[] | null;
	cursorKey: keyof Post;
	searchTerm?: string;
	fetchPosts: (cursor: string | number, searchTerm?: string) => void;
}

function PostDisplay({
	posts,
	owner = false,
	author,
	cursorKey,
	setPostInAction,
	searchTerm,
	fetchPosts,
}: PostDisplayProps) {
	const [cursor, setCursor] = useState(
		(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] || null
	);

	useEffect(() => {
		setCursor(
			(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] ||
				null
		);
	}, [posts]);

	const onLoadMore: MouseEventHandler = async () => {
		if (!fetchPosts || !posts || posts.length === 0) return;

		fetchPosts(cursor as string | number, searchTerm);
	};

	return (
		<div className="flex flex-col h-full overflow-x-hidden overflow-y-auto mt-8">
			<div className="flex flex-col gap-8 p-2">
				{posts?.map((post) => (
					<PostComponent
						key={post.id!}
						{...{
							post,
							author: author || post.bloggers?.name,
							owner: owner || false,
							setPostInAction,
						}}
					/>
				))}
			</div>
			{(posts?.length || 0) > 0 && (
				<div className="flex justify-center pb-10 mt-10">
					<div
						className="btn btn-sm normal-case bg-base-100"
						onClick={onLoadMore}
					>
						Load More
					</div>
				</div>
			)}
		</div>
	);
}

export default PostDisplay;
