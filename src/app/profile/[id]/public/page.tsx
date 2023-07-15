import { getUserPublicPosts } from "@/app/utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import Button from "@components/ui/button";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	LIMIT,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { SlNote } from "react-icons/sl";
import { TbNotes } from "react-icons/tb";

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
		<div className="h-full w-full flex gap-10 flex-col items-center justify-center">
			<div className="flex flex-col w-full gap-1">
				<blockquote className="font-fancy text-3xl font-bold text-gray-400">
					I never wrote things down to remember; I always wrote things
					down so I could forget.
				</blockquote>
				<a
					className="self-end font-fancy text-lg text-gray-400 italic underline"
					href="https://www.goodreads.com/quotes/10597502-i-never-wrote-things-down-to-remember-i-always-wrote"
					target="_blank"
				>
					- Matthew McConaughey, Greenlights
				</a>
			</div>
			<Link href={"/write"}>
				<Button className="px-3 py-1 gap-2">
					<SlNote />
					<span className="flex gap-1">
						<span>Start</span>
						<del> forgetting </del>
						<span>writing</span>
					</span>
				</Button>
			</Link>
		</div>
	);
}

export default PublicPosts;
