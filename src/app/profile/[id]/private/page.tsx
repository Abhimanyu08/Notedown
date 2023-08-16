import { getUserPrivatePosts } from "@utils/getData";
import { Database } from "@/interfaces/supabase";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
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

	if (data.length > 0) {
		return (
			<>
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
