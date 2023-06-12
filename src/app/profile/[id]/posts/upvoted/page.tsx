import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { LIMIT, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

export const revalidate = 0;

async function UpvotedPosts({ params }: { params: { id: string } }) {
	const { data } = await supabase
		.from(SUPABASE_UPVOTES_TABLE)
		.select(
			"created_at, post_id, upvoter, posts(id,created_by,title,description,language,published,published_on,upvote_count,bloggers(id, name))"
		)
		.match({ upvoter: params.id })
		.order("created_at", { ascending: false })
		.limit(LIMIT + 1);

	const hasMore = !!(data && data.length > LIMIT);
	console.log(data);

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
