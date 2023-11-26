import { Draft } from "@utils/processDrafts";
import { Database } from "@/interfaces/supabase";

export function postToDraft(
	post: Partial<Database["public"]["Tables"]["posts"]["Row"]>
): Draft {
	return {
		date: post.created_at!,
		timeStamp: post.timestamp!,
		title: post.title,
		description: post.description!,
		postId: `${post.id}`!,
		published: post.published,
		slug: post.slug || undefined,
		created_by: post.created_by!,
	};
}
