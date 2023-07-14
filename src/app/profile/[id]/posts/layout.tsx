import React from "react";
import PostControl from "./components/PostControl";
import SearchComponent from "./components/SearchComponent";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	SUPABASE_POST_TABLE,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { Sheet, SheetTrigger, SheetContent } from "@components/ui/sheet";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import Tabs, { TabChildren } from "@components/ui/tabs";

function ProfilePostsLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
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
		<div className="w-[700px] mx-auto py-10 h-full flex flex-col  relative gap-4">
			<PostControl />
			{/* <SearchComponent
				{...{
					publishPostAction,
					unpublishPostAction,
					deletePostAction,
				}}
			/> */}
			<div
				className="grow overflow-y-auto
			lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
			"
			>
				{children}
			</div>
		</div>
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
