import BlogContextProvider from "@/app/post/components/BlogState";
import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import Blog from "@components/BlogPostComponents/Blog";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import {
	BackButton,
	Edit,
	ExpandButton,
	Preview,
} from "../../../components/ModalButtons";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import PublishModal from "@/app/post/private/[postId]/components/PublishModal";

async function PrivatePostModal({ params }: { params: { postId: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls } = await getPost(
		params.postId,
		supabase
	);
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

		revalidatePath("/profile/[id]/posts/latest");
	}
	return (
		<div className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 bg-black">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					id: post.id,
					title: post.title,
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				<PublishModal publishPostAction={publishPostAction} />
				<Blog {...{ ...post, content }} extraClasses="w-full px-4" />
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-3">
				<Preview />
				<Edit postId={post.id} />
				<BackButton id={post.created_by || ""} />
				<ExpandButton postId={params.postId} privatePost={false} />
			</div>
		</div>
	);
}

export default PrivatePostModal;
