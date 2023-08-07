import { getPost } from "@utils/getData";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import BlogLayout from "../../components/BlogLayout";
import { parseFrontMatter } from "@utils/getResources";
import PrivateToolbar from "../../components/PrivateToolbar";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function PrivatePost({ params }: { params: PostParams }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	try {
		const { post, markdown, imagesToUrls, fileNames } = await getPost(
			params.postId,
			supabase
		);
		if (post.published) {
			redirect(`/post/${post.id}`);
		}

		return (
			<BlogContextProvider
				blogMeta={{
					id: post?.id,
					title: post?.title,
					description: post?.description,
					language: post?.language,
					imageFolder: post?.image_folder,
					blogger: post?.bloggers as { id: string; name: string },
				}}
				uploadedImages={imagesToUrls}
				fileNames={fileNames}
			>
				<BlogLayout
					postMeta={{ post, markdown, imagesToUrls, fileNames }}
					ToolbarComponent={PrivateToolbar}
					AuthorComponent={BlogAuthorServer}
				/>
			</BlogContextProvider>
		);
	} catch (e) {
		redirect("/");
	}
}

export default PrivatePost;
