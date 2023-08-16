import { getUserAllPosts } from "@utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import OwnerOnlyStuff from "../../../../components/ProfileComponents/OwnerOnlyStuff";

async function Notes({ params }: { params: { id: string } }) {
	const supabase = createServerComponentSupabaseClient({
		headers,
		cookies,
	});

	const { data, hasMore } = await getUserAllPosts(params.id, supabase);
	if (data.length > 0) {
		return (
			<>
				<PostDisplay key={"all_posts"} posts={data || []} />
				<Paginator
					key="all"
					cursorKey="created_at"
					postType="all"
					lastPost={data!.at(data!.length - 1)!}
					hasMore={hasMore}
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
			<OwnerOnlyStuff id={params.id}>
				<p>
					All your notes (public and private) will be diplayed here.
				</p>
			</OwnerOnlyStuff>
		</div>
	);
}

export default Notes;
