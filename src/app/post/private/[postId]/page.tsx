import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import BlogLayout from "../../components/BlogLayout";
import { parseFrontMatter } from "@utils/getResources";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function PrivatePost({ params }: { params: PostParams }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	try {
		const { post, markdown, imagesToUrls } = await getPost(
			params.postId,
			supabase
		);
		if (post.published) {
			redirect(`/post/${post.id}`);
		}

		return (
			<BlogLayout
				postMeta={{ post, markdown, imagesToUrls }}
				isPostPrivate={true}
			/>
		);
	} catch (e) {
		redirect("/");
	}
}

export default PrivatePost;
