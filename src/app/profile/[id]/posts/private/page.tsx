import { getUserPrivatePosts } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { LIMIT } from "@utils/constants";
import { cookies, headers } from "next/headers";

// export const revalidate = 0;

async function PrivatePosts({ params }: { params: { id: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});
	const userId = (await supabase.auth.getUser()).data.user?.id;
	if (userId === undefined || userId !== params.id) return <></>;
	const data = await getUserPrivatePosts(userId, supabase);

	const hasMore = !!(data && data.length > LIMIT);
	if (!data) return <p>No posts lol</p>;
	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay key="private_posts" posts={data || []} />
			<Paginator
				key="private"
				cursorKey="created_at"
				postType="private"
				lastPost={data!.at(data!.length - 1)!}
				hasMore={hasMore}
			/>
		</>
	);
}

export default PrivatePosts;
