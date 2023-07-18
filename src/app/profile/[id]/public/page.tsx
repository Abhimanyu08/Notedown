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
import getPostActionFunctions from "@utils/postActionFunctions";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { SlNote } from "react-icons/sl";
import { TbNotes } from "react-icons/tb";

// export const revalidate = 60 * 60 * 24 * 365 * 10;

async function PublicPosts({ params }: { params: { id: string } }) {
	const { data, hasMore } = await getUserPublicPosts(params.id);

	const [publishPostAction, unpublishPostAction, deletePostAction] =
		getPostActionFunctions(headers, cookies, revalidatePath);

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
			The notes on which you decide to hit the "Publish" button will be
			shown here. As of now, there are none.
		</p>
	);
}

export default PublicPosts;
