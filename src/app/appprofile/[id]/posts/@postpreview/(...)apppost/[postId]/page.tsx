import BlogContextProvider from "@/app/apppost/components/BlogState";
import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import Blog from "@components/BlogPostComponents/Blog";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { BackButton, ExpandButton } from "../../../components/ModalButtons";

async function PostModal({ params }: { params: { postId: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls } = await getPost(
		params.postId,
		supabase
	);
	return (
		<div className="flex flex-col items-center justify-center h-full w-full relative">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				<Blog {...{ ...post, content }} extraClasses="w-full px-4" />
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-3">
				<BackButton id={post.created_by || ""} />
				<ExpandButton postId={params.postId} />
			</div>
		</div>
	);
}

export default PostModal;
