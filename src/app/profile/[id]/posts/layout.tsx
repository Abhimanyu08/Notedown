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
		<div className="relative">
			{/* <SearchModal /> */}
			<Sheet>
				<SheetTrigger className="absolute top-4 left-4">
					<button>
						<RxHamburgerMenu />
					</button>
				</SheetTrigger>
				<SheetContent side={"left"} className="w-[200px]">
					<div className="flex flex-col gap-4 ">
						<Link href={`/profile/${params.id}/posts/public`}>
							Public Notes
						</Link>
						<Link href={`/profile/${params.id}/posts/private`}>
							Private Notes
						</Link>
						<Link href={`/profile/${params.id}/posts/drafts`}>
							Drafts
						</Link>
					</div>
				</SheetContent>
			</Sheet>
			{/* <div className="w-full flex flex-col px-2 gap-4 h-full overflow-hidden relative ">
				<SearchComponent
					{...{
						publishPostAction,
						unpublishPostAction,
						deletePostAction,
					}}
				/>
				<div className="flex justify-start gap-2 mr-4 ">
					<PostControl />
				</div>

				<div className="overflow-y-auto grow">{children}</div>
			</div> */}
		</div>
	);
}

export default ProfilePostsLayout;
