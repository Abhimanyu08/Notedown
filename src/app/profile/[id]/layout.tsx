import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import React from "react";
import PostControl from "./components/PostControl";
import Button from "@components/ui/button";
import { SlNote } from "react-icons/sl";
import Link from "next/link";
import LayoutChange from "./components/LayoutChange";

function ProfilePostsLayout({
	children,
	postpreview,
}: {
	children: React.ReactNode;
	postpreview: React.ReactNode;
}) {
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
	return (
		<LayoutChange>
			<>
				<div className="flex w-full items-end justify-between">
					<PostControl />
					<input
						type="text"
						name=""
						id=""
						placeholder="Search"
						className="h-6 p-4 bg-transparent border-[1px] border-gray-400 rounded-md w-32 focus:w-52 transition-all duration-200"
					/>
				</div>
				<div
					className="grow overflow-y-auto
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				"
				>
					{children}
				</div>
			</>
			{/* <SearchComponent
				{...{
					publishPostAction,
					unpublishPostAction,
					deletePostAction,
				}}
			/> */}
			{/* <aside className="absolute top-[400px] left-[-30%]">
				<Link href={"/write"}>
					<Button className="px-2 py-1 gap-2">
						<SlNote /> New Note
					</Button>
				</Link>
			</aside> */}
			<>{postpreview}</>
		</LayoutChange>
	);
}

{
	/* <div className="w-full flex flex-col px-2 gap-4 h-full overflow-hidden relative ">
				
				<div className="flex justify-start gap-2 mr-4 ">
					<PostControl />
				</div>

				<div className="overflow-y-auto grow">{children}</div>
			</div> */
}
export default ProfilePostsLayout;
