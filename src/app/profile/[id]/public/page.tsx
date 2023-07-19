import { getUserPublicPosts } from "@/app/utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

// export const revalidate = 60 * 60 * 24 * 365 * 10;

async function PublicPosts({ params }: { params: { id: string } }) {
	const { data, hasMore } = await getUserPublicPosts(params.id);

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

		revalidatePath("/profile/[id]");
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

		revalidatePath("/profile/[id]");
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
			revalidatePath("/profile/[id]/private");
		}
	}
	if (data.length > 0) {
		return (
			<>
				{/* @ts-expect-error Async Server Component  */}
				<PostDisplay
					key={"public_posts"}
					posts={data || []}
					{...{
						publishPostAction,
						unpublishPostAction,
						deletePostAction,
					}}
				/>
				<Paginator
					key="public"
					cursorKey="published_on"
					postType="public"
					lastPost={data!.at(data!.length - 1)!}
					hasMore={hasMore}
					{...{
						publishPostAction,
						unpublishPostAction,
						deletePostAction,
					}}
				/>
			</>
		);
	}
	return (
		<p className="px-2 text-gray-500">
			The notes on which you decide to hit the {`"Publish"`} button will
			be shown here. As of now, there are none.
		</p>
	);
}

export default PublicPosts;
