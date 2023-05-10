import Blogger from "interfaces/Blogger";
import Post from "interfaces/Post";
import PostWithBlogger from "interfaces/PostWithBlogger";
import { ProfileUser } from "interfaces/ProfileUser";
import React from "react";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
	LIMIT,
} from "@utils/constants";
import { supabase } from "../../../../utils/supabaseClient";

async function Profile({ params }: { params: { id: string } }) {
	const id = params.id;
	let userData: Blogger | null = null;
	let latest: Partial<PostWithBlogger>[] | null = null;
	let greatest: Partial<Post>[] | null = null;

	let error;

	await Promise.all([
		supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.select("id,name,avatar_url,about,twitter,github,web")
			.eq("id", id)
			.single()
			.then((val) => {
				userData = val.data;
				error = val.error;
			}),

		supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select(
				"id,published,published_on,title,description,language,bloggers(name),created_by"
			)
			.eq("created_by", id)
			.order("published_on", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				latest = val.data;
				error = val.error;
			}),

		supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select(
				"id,published,published_on,title,description,language,bloggers(name),created_by"
			)
			.eq("created_by", id)
			.order("upvote_count", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				greatest = val.data;
				error = val.error;
			}),
	]);

	console.log(userData, latest, greatest);
	return <div>page</div>;
}

export default Profile;
