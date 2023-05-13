import PostWithBlogger from "@/interfaces/PostWithBlogger";
import PostDisplay from "@components/PostDisplay";
import { LIMIT, SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

async function LatestPosts({ params }: { params: { id: string } }) {
	const { id } = params;
	// await new Promise((res) => setTimeout(res, 20 * 1000));
	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(
			"id,published,published_on,title,description,language,bloggers(name,id),created_by"
		)
		.eq("created_by", id)
		.order("published_on", { ascending: false })
		.limit(LIMIT);

	return (
		/* @ts-expect-error Async Server Component  */
		<PostDisplay
			key={"latest_posts"}
			posts={data || []}
			cursorKey="published_on"
			searchTerm={""}
		/>
	);
}

export default LatestPosts;
