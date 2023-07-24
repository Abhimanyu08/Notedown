import { getUserPublicPosts } from "@/app/utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";

// export const revalidate = 60 * 60 * 24 * 365 * 10;

async function PublicPosts({ params }: { params: { id: string } }) {
	const { data, hasMore } = await getUserPublicPosts(params.id);

	if (data.length > 0) {
		return (
			<>
				{/* @ts-expect-error Async Server Component  */}
				<PostDisplay key={"public_posts"} posts={data || []} />
				<Paginator
					key="public"
					cursorKey="published_on"
					postType="public"
					lastPost={data!.at(data!.length - 1)!}
					hasMore={hasMore}
				/>
			</>
		);
	}
	return (
		<p className="px-2 text-gray-500">
			The notes on which you decide to hit the {`"Publish"`} button will
			be shown here. As of now, there are none.
		</p>
	);
}

export default PublicPosts;
