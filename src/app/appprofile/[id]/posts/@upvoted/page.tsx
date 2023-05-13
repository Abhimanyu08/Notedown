import { Database } from "@/interfaces/supabase";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	LIMIT,
	SUPABASE_POST_TABLE,
	SUPABASE_UPVOTES_TABLE,
} from "@utils/constants";
import { headers, cookies } from "next/headers";
import profile from "react-syntax-highlighter/dist/esm/languages/hljs/profile";

async function UpvotedPosts() {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const userId = (await supabase.auth.getUser()).data.user?.id;
	const { data } = await supabase
		.from(SUPABASE_UPVOTES_TABLE)
		.select("created_at, post_id")
		.match({ upvoter: userId })
		.order("created_at", { ascending: false })
		.limit(LIMIT);
	const { data: posts } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(
			"id,created_by,title,description,language,published,published_on,upvote_count,bloggers(name)"
		)
		.in("id", data?.map((upvote) => upvote.post_id) || []);

	return (
		/* @ts-expect-error Async Server Component  */
		<PostDisplay
			key={"latest_posts"}
			posts={posts || []}
			cursorKey="published_on"
			searchTerm={""}
		/>
	);
}

export default UpvotedPosts;
