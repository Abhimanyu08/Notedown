import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import PostComponent from "./PostComponent";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";

interface PostDisplayProps {
	posts: Partial<Database["public"]["Tables"]["posts"]["Row"]>[];
}

async function PostDisplay({ posts }: PostDisplayProps) {
	const idArray = posts?.map((post) => post.id!);
	let idToUpvotes: Record<number, number> = {};
	if (idArray) {
		const { data } = await supabase
			.from(SUPABASE_POST_TABLE)
			.select("id,upvote_count")
			.in("id", idArray);
		if (data) {
			data.forEach((post) => {
				idToUpvotes[post.id] = post.upvote_count;
			});
		}
	}

	async function publishPostAction(postId: number) {
		"use server";
		const supabase = createServerComponentSupabaseClient({
			headers,
			cookies,
		});
		await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: true,
				published_on: new Date().toISOString(),
			})
			.match({ id: postId });

		const { data } = await supabase.auth.getUser();

		const profileId = data.user?.id;
		console.log("Profile id in server action --------> ", profileId);

		revalidatePath(`/appprofile/${profileId}/posts/latest`);
		revalidatePath(`/appprofile/${profileId}/posts/private`);
	}

	return (
		<>
			{(posts?.length || 0) > 0 ? (
				<div className="flex flex-col gap-8">
					{posts?.map((post, idx) => (
						<PostComponent
							key={idx}
							post={post}
							upvotes={idToUpvotes[post.id!]}
							publishAction={publishPostAction}
						/>
					))}
				</div>
			) : (
				<p className="self-center mt-10 text-white/70">No Posts yet</p>
			)}
		</>
	);
}

export default PostDisplay;
