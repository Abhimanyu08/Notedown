import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import BlogLayout from "../../components/BlogLayout";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function PrivatePost({ params }: { params: PostParams }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

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

	try {
		const { post, content, imagesToUrls } = await getPost(
			params.postId,
			supabase
		);
		if (post.published) {
			redirect(`/post/${post.id}`);
		}

		return (
			<BlogLayout
				postMeta={{ post, content, imagesToUrls }}
				isPostPrivate={true}
			/>
			// <BlogContextProvider
			// 	blogMeta={{
			// 		id: parseInt(params.postId!),
			// 		title: post.title,
			// 		description: post.description,
			// 		language: post.language,
			// 		imageFolder: post.image_folder,
			// 	}}
			// 	uploadedImages={imagesToUrls}
			// >
			// 	<PublishModal publishPostAction={publishPostAction} />
			// 	<div className="grow flex flex-row min-h-0 relative pt-10">
			// 		<div
			// 			className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start flex
			// 		`}
			// 		>
			// 			<Toc html={content} />
			// 		</div>
			// 		<div
			// 			className={`lg:basis-3/5 relative
			// 				hidden lg:block
			// 				overflow-y-hidden`}
			// 		>
			// 			<Blog
			// 				content={content}
			// 				{...post}
			// 				extraClasses="px-20"
			// 			/>
			// 		</div>
			// 		<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
			// 			<PrivateToolbar language={post.language} />
			// 		</div>
			// 	</div>
			// </BlogContextProvider>
		);
	} catch (e) {
		redirect("/");
	}
}

export default PrivatePost;
