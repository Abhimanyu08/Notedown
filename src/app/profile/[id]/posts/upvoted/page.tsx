import { getUpvotedPosts } from "@/app/utils/getData";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { LIMIT, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

export const revalidate = 0;

async function UpvotedPosts({ params }: { params: { id: string } }) {
	const { data, hasMore } = await getUpvotedPosts(params.id);
	if (!data) return <></>;

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay
				key={"upvoted_posts"}
				posts={data
					.filter((d) => d.posts !== null)
					.map((d) => d.posts as PostWithBlogger)}
			/>
			<Paginator
				key={"upvoted"}
				postType="upvoted"
				lastPost={data.at(-1)!}
				cursorKey={"created_at"}
				hasMore={hasMore}
			/>
		</>
	);
}

export default UpvotedPosts;
