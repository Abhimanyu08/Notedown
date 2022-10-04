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
	fetchPosts: ({
		cursor,
		searchTerm,
	}: {
		cursor: string | number;
		searchTerm?: string;
	}) => Promise<boolean | undefined>;
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
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		setCursor(
			(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] ||
				null
		);
	}, [posts]);

	const onLoadMore: MouseEventHandler = async (e) => {
		e.preventDefault();

		if (!fetchPosts || !posts || posts.length === 0 || !hasMore) return;

		fetchPosts({
			cursor: cursor as string | number,
			searchTerm: searchTerm?.split(" ").join(" | "),
		}).then((val) => val !== undefined && setHasMore(val));
	};

	return (
		<div className="flex flex-col h-full overflow-x-hidden  md:overflow-y-auto">
			<div
				className="flex flex-col gap-8"
				onScroll={(e) => e.currentTarget}
			>
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
				<div className="flex justify-center pb-10 mt-10 mb-10 md:mb-0">
					<div
						className="normal-case bg-base-100 rounded-md p-2 text-xs font-semibold cursor-pointer text-white"
						onClick={onLoadMore}
					>
						{hasMore ? "Load More" : "No More"}
					</div>
				</div>
			)}
		</div>
	);
}

export default PostDisplay;
