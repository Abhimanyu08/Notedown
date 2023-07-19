import { getUserPrivatePosts } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
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
	return (
		<div className="flex text-gray-500 flex-col  px-2 mt-10 gap-10">
			<p className="font-serif italic">
				Write notes for yourself by default, disregarding audience -
				<a
					href="https://notes.andymatuschak.org/Evergreen_notes?stackedNotes=zXDPrYcxUSZbF5M8vM5Y1U9"
					target="_blank"
					className="underline underline-offset-2"
				>
					Andy Matuschak
				</a>
			</p>
			<p>
				All your notes will be private by default. They{`'`}ll be
				diplayed here in a chronological manner.
			</p>
		</div>
	);
}

export default PrivatePosts;
