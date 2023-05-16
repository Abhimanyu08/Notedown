import { getUserLatestPosts } from "@/app/utils/getData";
import Paginator from "@components/Paginator";
import PostDisplay from "@components/PostDisplay";

async function LatestPosts({ params }: { params: { id: string } }) {
	// await new Promise((res) => setTimeout(res, 20 * 1000));
	// const { data } = await supabase
	// 	.from(SUPABASE_POST_TABLE)
	// 	.select(
	// 		"id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
	// 	)
	// 	.eq("created_by", id)
	// 	.order("published_on", { ascending: false })
	// 	.limit(LIMIT);
	const data = await getUserLatestPosts(params.id);

	return (
		<>
			{/* @ts-expect-error Async Server Component  */}
			<PostDisplay key={"latest_posts"} posts={data || []} />
			<Paginator
				key="latest"
				cursorKey="published_on"
				postType="latest"
				lastPost={data!.at(data!.length - 1)!}
			/>
		</>
	);
	return <></>;
}

export default LatestPosts;
