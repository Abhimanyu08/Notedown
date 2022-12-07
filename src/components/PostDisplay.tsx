import {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";
import Post from "../interfaces/Post";
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
		<div className="flex flex-col overflow-x-hidden h-fit px-1 pt-1">
			{(posts?.length || 0) > 0 ? (
				<div
					className="flex flex-col gap-6 lg:gap-8 lg:basis-11/12 basis-10/12"
					onScroll={(e) => e.currentTarget}
				>
					{posts?.map((post, idx) => (
						<PostComponent
							key={idx}
							{...{
								post,
								author: post.author || post.bloggers?.name,
								owner: user?.id === post.created_by,
								setPostInAction,
							}}
						/>
					))}
				</div>
			) : (
				<p className="self-center mt-10 text-white/70">No Posts yet</p>
			)}
			{(posts?.length || 0) > 0 && (
				<div className="flex justify-center pt-32 pb-28 lg:pb-10 lg:basis-1/12 basis-2/12">
					<div
						className="h-fit normal-case w-fit dark:profile-tool-dark rounded-md px-2 py-1 text-xs font-normal md:font-semibold cursor-pointer profile-tool shadow-sm shadow-black dark:shadow-white/40
						active:scale-90	transition-[scale] duration-150
						"
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
