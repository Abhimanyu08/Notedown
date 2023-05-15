import Post from "@/interfaces/Post";
import { Database } from "@/interfaces/supabase";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { Dispatch, SetStateAction } from "react";
import PostComponent from "./PostComponent";

type PostWithBlogger = Database["public"]["Tables"]["posts"]["Row"] & {
	blogger: Database["public"]["Tables"]["bloggers"]["Row"];
};

interface PostDisplayProps {
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
	posts: Partial<Database["public"]["Tables"]["posts"]["Row"]>[];
	cursorKey: keyof PostWithBlogger;
	searchTerm?: string;
	fetchPosts?: ({
		cursor,
		searchTerm,
	}: {
		cursor: string | number;
		searchTerm?: string;
	}) => Promise<boolean | undefined>;
}

async function PostDisplay({
	posts,
	cursorKey,
	setPostInAction,
	searchTerm,
	fetchPosts,
}: PostDisplayProps) {
	// const [cursor, setCursor] = useState(
	// 	(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] || null
	// );
	// const [hasMore, setHasMore] = useState(true);

	// const { user } = useContext(UserContext);

	// useEffect(() => {
	// 	setCursor(
	// 		(posts?.at(posts.length - 1) || {})[cursorKey || "created_at"] ||
	// 			null
	// 	);
	// }, [posts]);

	// const onLoadMore: MouseEventHandler = async (e) => {
	// 	e.preventDefault();

	// 	if (!fetchPosts || !posts || posts.length === 0 || !hasMore) return;

	// 	fetchPosts({
	// 		cursor: cursor as string | number,
	// 		searchTerm: searchTerm?.split(" ").join(" | "),
	// 	}).then((val) => val !== undefined && setHasMore(val));
	// };

	const idArray = posts?.map((post) => post.id!);
	let idToUpvotes: Record<number, number> = {};
	if (idArray) {
		const { data } = await supabase
			.from(SUPABASE_POST_TABLE)
			.select("id,upvote_count")
			.in("id", idArray);
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
					{posts?.map((post, idx) => (
						<PostComponent
							key={idx}
							post={post}
							upvotes={idToUpvotes[post.id!]}
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
