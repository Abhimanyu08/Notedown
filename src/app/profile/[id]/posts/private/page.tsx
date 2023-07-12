import { getUserPrivatePosts } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	LIMIT,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

// export const revalidate = 0;

async function PrivatePosts({ params }: { params: { id: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});
	const userId = (await supabase.auth.getUser()).data.user?.id;
	if (userId === undefined || userId !== params.id) return <></>;
	const { data, hasMore } = await getUserPrivatePosts(userId, supabase);

	if (!data) return <p>No posts lol</p>;

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

		revalidatePath("/profile/[id]/posts/public");
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

		revalidatePath("/profile/[id]/posts/public");
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
				revalidatePath("/profile/[id]/posts/public");
			} else {
				revalidatePath("/profile/[id]/posts/private");
			}
		}
	}

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay
				key="private_posts"
				posts={data || []}
				{...{
					publishPostAction,
					unpublishPostAction,
					deletePostAction,
				}}
			/>
			<Paginator
				key="private"
				cursorKey="created_at"
				postType="private"
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

export default PrivatePosts;
