import PostDisplay from "@components/PostDisplay";
import React from "react";
import { supabase } from "../../../utils/supabaseClient";
import PostWithBlogger from "interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE, LIMIT } from "../../../utils/constants";

async function Read() {
	//How do I deal with pagination in PostDisplay using react server components

	const { data } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(
			`id,created_by,title,description,language,published,published_on,bloggers(name)`
		)
		.match({ published: true })
		.order("published_on", { ascending: false })
		.limit(LIMIT);
	// const fetchHomePosts = async ({ cursor }: { cursor: string | number }) => {
	// 	const { data, error } = await supabase
	// 		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
	// 		.select("*,bloggers(name)")
	// 		.match({ published: true })
	// 		.lt("published_on", cursor)
	// 		.order("published_on", { ascending: false })
	// 		.limit(LIMIT);

	// 	if (error || !data) {
	// 		console.log(error.message || "data returned is null");
	// 		return false;
	// 	}
	// 	setHomePosts((prev) => [...(prev || []), ...data]);
	// 	return data.length > 0;
	// };

	return (
		<div className="w-full mx-auto lg:w-[50%] grow mt-6 px-2 lg:px-0 md:mt-12 overflow-hidden">
			<PostDisplay
				key={"latest_posts"}
				posts={data || []}
				cursorKey="published_on"
				searchTerm={""}
			/>
		</div>
	);
}

export default Read;
