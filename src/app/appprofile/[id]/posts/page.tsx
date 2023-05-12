import PostWithBlogger from "@/interfaces/PostWithBlogger";
import PostDisplay from "@components/PostDisplay";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import React from "react";
import PostControl from "./PostControl";

async function ProfilePosts({ params }: { params: { id: string } }) {
	const { id } = params;
	// await new Promise((res) => setTimeout(res, 20 * 1000));
	const { data } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(
			"id,published,published_on,title,description,language,bloggers(name,id),created_by"
		)
		.eq("created_by", id)
		.order("published_on", { ascending: false });

	return (
		<div className="w-full flex flex-col gap-4">
			<PostControl />

			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay
				key={"latest_posts"}
				posts={data || []}
				cursorKey="published_on"
				searchTerm={""}
			/>
		</div>
	);
}

export default ProfilePosts;
