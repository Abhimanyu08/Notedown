import { getUserLatestPosts } from "@/app/utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";
import { LIMIT } from "@utils/constants";

// export const revalidate = 60 * 60 * 24 * 365 * 10;

async function LatestPosts({ params }: { params: { id: string } }) {
	const data = await getUserLatestPosts(params.id);

	const hasMore = !!(data && data.length > LIMIT);

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay key={"latest_posts"} posts={data || []} />
			<Paginator
				key="latest"
				cursorKey="published_on"
				postType="latest"
				lastPost={data!.at(data!.length - 1)!}
				hasMore={hasMore}
			/>
		</>
	);
}

export default LatestPosts;
