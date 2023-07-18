import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import { supabase } from "@utils/supabaseClient";

import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import { ExpandButton } from "../../../components/ModalButtons";

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
		<div className="flex flex-col items-center justify-center h-full w-full z-40">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				<Blog
					{...post}
					content={content}
					extraClasses="w-full px-4"
					AuthorComponent={BlogAuthorServer}
				/>
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-3">
				<ExpandButton postId={params.postId} privatePost={false} />
			</div>
		</div>
	);
}

export default PostModal;
