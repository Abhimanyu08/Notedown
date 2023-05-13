import React from "react";
import Image from "next/image";
import {
	LIMIT,
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import error from "next/error";
import Blogger from "@/interfaces/Blogger";
import ProfileControl from "./components/ProfileControl";

async function ProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	const id = params.id;
	// let latest: unknown;
	// let greatest: unknown;
	const { data: userData } = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("id,name,avatar_url,about,twitter,github,web")
		.eq("id", params.id)
		.single();

	// await Promise.all([

	// 	supabase
	// 		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
	// 		.select(
	// 			"id,published,published_on,title,description,language,bloggers(name),created_by"
	// 		)
	// 		.eq("created_by", id)
	// 		.order("published_on", { ascending: false })
	// 		.limit(LIMIT)
	// 		.then((val) => {
	// 			latest = val.data;
	// 			error = val.error;
	// 		}),

	// 	supabase
	// 		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
	// 		.select(
	// 			"id,published,published_on,title,description,language,bloggers(name),created_by"
	// 		)
	// 		.eq("created_by", id)
	// 		.order("upvote_count", { ascending: false })
	// 		.limit(LIMIT)
	// 		.then((val) => {
	// 			greatest = val.data;
	// 			error = val.error;
	// 		}),
	// ]);
	return (
		<div className="lg:grid flex lg:w-4/6 mx-auto flex-col grow  h-full overflow-y-auto lg:overflow-y-clip lg:grid-cols-7 text-white gap-y-10 pt-10">
			<div className="lg:col-span-2 flex flex-col items-center max-h-full">
				<Image
					src={userData?.avatar_url || ""}
					width={140}
					height={140}
					alt={`Rce-blog profile picture of ${userData?.name}`}
					className="rounded-full"
				/>
				<ProfileControl />
			</div>

			<div className="lg:col-span-5 overflow-auto relative">
				{children}
			</div>
		</div>
	);
}

export default ProfileLayout;
