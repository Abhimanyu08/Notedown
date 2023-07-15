import { getUserPrivatePosts } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
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
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { SlNote } from "react-icons/sl";

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
		<div className="h-full w-full flex flex-col gap-10 items-center justify-center">
			<div className="flex flex-col gap-2">
				<p className="font-fancy text-3xl text-gray-400">
					Write notes for yourself by default, disregarding audience
				</p>
				<span className="self-end font-fancy text-lg text-gray-400 italic underline">
					-
					<a
						href="https://notes.andymatuschak.org/Evergreen_notes?stackedNotes=z8AfCaQJdp852orumhXPxHb3r278FHA9xZN8J"
						target="_blank"
					>
						Andy Matuschak
					</a>
				</span>
			</div>
			<Link href={"/write"}>
				<Button className="px-3 py-1 gap-2 ">
					<SlNote />
					<span>Start Writing</span>
				</Button>
			</Link>
		</div>
	);
}

export default PrivatePosts;
