import { getUpvotes } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import PostComponent from "./PostComponent";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import UpvoteWithPost from "@/interfaces/Upvotes";

interface PostDisplayProps {
	posts: PostWithBlogger[];
}

async function PostDisplay({ posts }: PostDisplayProps) {
	const idArray = posts?.map((post) => post.id!);
	let idToUpvotes: Record<number, number> = {};
	// if (idArray) {
	// 	const data = await getUpvotes(idArray);
	// 	if (data) {
	// 		data.forEach((post) => {
	// 			idToUpvotes[post.id] = post.upvote_count;
	// 		});
	// 	}
	// }

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

		revalidatePath("/profile/[id]/posts/latest");
	}

	async function unpublishPostAction(postId: number) {
		"use server";
		const supabase = createServerComponentSupabaseClient({
			headers,
			cookies,
		});
		await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: false,
			})
			.match({ id: postId });

		revalidatePath("/profile/[id]/posts/latest");
	}

	async function deletePostAction(postId: number) {
		"use server";
		const supabase = createServerComponentSupabaseClient({
			headers,
			cookies,
		});
		const { data } = await supabase
			.from(SUPABASE_POST_TABLE)
			.delete()
			.match({ id: postId })
			.select("filename, image_folder, published")
			.single();

		if (data) {
			await supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.remove([data?.filename]);

			const { data: imageFiles } = await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.list(data.image_folder);

			if (imageFiles) {
				const imageNames = imageFiles.map(
					(i) => `${data.image_folder}/${i.name}`
				);
				await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.remove(imageNames);
			}
			if (data.published) {
				revalidatePath("/profile/[id]/posts/latest");
			} else {
				revalidatePath("/profile/[id]/posts/private");
			}
		}
	}

	return (
		<>
			{(posts?.length || 0) > 0 ? (
				<div className="flex flex-col gap-8">
					{posts?.map((post) => (
						<PostComponent
							key={post.id}
							post={post}
							upvotes={idToUpvotes[post.id!]}
							{...{
								publishPostAction,
								unpublishPostAction,
								deletePostAction,
							}}
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
