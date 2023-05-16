import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { LIMIT, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

async function UpvotedPosts({ params }: { params: { id: string } }) {
	// const { data } = await supabase
	// 	.from(SUPABASE_UPVOTES_TABLE)
	// 	.select(
	// 		"created_at, post_id, upvoter, posts(id,created_by,title,description,language,published,published_on,upvote_count,bloggers(id, name))"
	// 	)
	// 	.match({ upvoter: params.id })
	// 	.order("created_at", { ascending: false })
	// 	.limit(LIMIT);

	// if (!data) return <></>;

	// return (
	// 	<>
	// 		<PostDisplay
	// 			key={"upvoted_posts"}
	// 			posts={data?.map((d) => d.posts) || []}
	// 		/>
	// 		<Paginator
	// 			key={"upvoted"}
	// 			postType="upvoted"
	// 			lastPost={data.at(data!.length - 1)}
	// 			cursorKey={"created_at"}
	// 		/>
	// 	</>
	// );
	return <></>;
}

export default UpvotedPosts;
