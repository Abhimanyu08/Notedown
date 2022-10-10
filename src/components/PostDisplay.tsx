import {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";
import Post from "../interfaces/Post";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import SearchResult from "../interfaces/SearchResult";
import { UserContext } from "../pages/_app";
import PostComponent from "./PostComponent";

interface PostDisplayProps {
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
	posts: Partial<SearchResult>[] | null;
	cursorKey: keyof SearchResult | "upvoted_on";
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
	cursorKey,
	setPostInAction,
	searchTerm,
	fetchPosts,
}: PostDisplayProps) {
	const [cursor, setCursor] = useState(
		(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] || null
	);
	const [hasMore, setHasMore] = useState(true);

	const { user } = useContext(UserContext);

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
				className="flex flex-col gap-8 md:basis-11/12 basis-10/12"
				onScroll={(e) => e.currentTarget}
			>
				{posts?.map((post) => (
					<PostComponent
						key={post.id!}
						{...{
							post,
							author: post.author || post.bloggers?.name,
							owner: user?.id === post.created_by,
							setPostInAction,
						}}
					/>
				))}
			</div>
			{(posts?.length || 0) > 0 && (
				<div className="flex justify-center py-20 md:basis-1/12 basis-2/12">
					<div
						className="lm h-fit normal-case rounded-md px-2 py-1 text-xs font-normal md:font-semibold cursor-pointer text-white"
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
