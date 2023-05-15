import PostDisplay from "@components/PostDisplay";
import { LIMIT, SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import React from "react";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import Paginator from "@components/Paginator";

async function GreatestPosts({ params }: { params: { id: string } }) {
	const { id } = params;
	// await new Promise((res) => setTimeout(res, 20 * 1000));
	console.log("Id---------------------------->", id);
	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(
			"id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at,upvote_count"
		)
		.eq("created_by", id)
		.order("upvote_count", { ascending: false })
		.limit(LIMIT);

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay
				key={"greatest_posts"}
				posts={data || []}
				cursorKey="upvote_count"
				searchTerm={""}
			/>
			<Paginator
				key="greatest"
				cursorKey="upvote_count"
				postType="greatest"
				lastPost={data!.at(data!.length - 1)!}
			/>
		</>
	);
}

export default GreatestPosts;
