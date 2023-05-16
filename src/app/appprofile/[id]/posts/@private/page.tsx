import { cookies, headers } from "next/headers";

import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { LIMIT, SUPABASE_POST_TABLE } from "@utils/constants";

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

	if (!data) return <p>No posts</p>;

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay key="private_posts" posts={data || []} />
			<Paginator
				key="private"
				cursorKey="created_at"
				postType="private"
				lastPost={data!.at(data!.length - 1)!}
			/>
		</>
	);
}

export default PrivatePosts;
