import { Database } from "@/interfaces/supabase";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import PostComponent from "./PostComponent";

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

	return (
		<>
			{(posts?.length || 0) > 0 ? (
				<div className="flex flex-col gap-8">
					{posts?.map((post, idx) => (
						<PostComponent
							key={idx}
							post={post}
							upvotes={idToUpvotes[post.id!]}
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
