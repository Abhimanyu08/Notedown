import { headers, cookies } from "next/headers";

import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import Post from "@/interfaces/Post";
import { SUPABASE_POST_TABLE, LIMIT } from "@utils/constants";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { Database } from "@/interfaces/supabase";
import PostDisplay from "@components/PostDisplay";

async function PrivatePosts() {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const userId = (await supabase.auth.getUser()).data.user?.id;
	const { data, error } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(
			"id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
		)
		.match({ created_by: userId, published: false })
		.order("created_at", { ascending: false })
		.limit(LIMIT);

	console.log(userId, data, cookies());
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

export default PrivatePosts;
