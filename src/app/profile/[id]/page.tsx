import { getUserAllPosts } from "@/app/utils/getData";
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
import OwnerOnlyStuff from "./components/OwnerOnlyStuff";

async function Notes({ params }: { params: { id: string } }) {
	const supabase = createServerComponentSupabaseClient({
		headers,
		cookies,
	});
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

		revalidatePath("/profile/[id]/public");
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

		revalidatePath("/profile/[id]/public");
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
				revalidatePath("/profile/[id]/public");
			} else {
				revalidatePath("/profile/[id]/private");
			}
		}
	}
	const { data, hasMore } = await getUserAllPosts(params.id, supabase);
	if (data.length > 0) {
		return (
			<>
				{/* @ts-expect-error Async Server Component  */}
				<PostDisplay
					key={"all_posts"}
					posts={data || []}
					{...{
						publishPostAction,
						unpublishPostAction,
						deletePostAction,
					}}
				/>
				<Paginator
					key="all"
					cursorKey="created_at"
					postType="all"
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
			<div className="flex flex-col gap-1 font-serif italic text-left">
				<span>Lying in wait, set to pounce on the blank page,</span>
				<span>are letters up to no good,</span>
				<span>clutches of clauses so subordinate</span>
				<span>they{`'`}ll never let her get away.</span>

				<span className="underline underline-offset-2 text-sm self-center">
					- The Joy Of Writing, Wislawa Szymborska
				</span>
			</div>
			<OwnerOnlyStuff>
				<p>
					All your notes (public and private) will be diplayed here.
				</p>
			</OwnerOnlyStuff>
		</div>
	);
}

export default Notes;
