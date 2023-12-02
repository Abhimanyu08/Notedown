import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { getPost } from "@utils/getData";
import { cookies } from "next/headers";
import PostPreviewControls from "./PostPreviewControls";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import { tagToJsxConverterWithContext } from "@utils/html2Jsx/minimalJsxConverter";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { parseFrontMatter } from "@utils/parseFrontMatter";
import Footers from "@components/BlogPostComponents/Footers";
import SyncWarning from "@components/BlogPostComponents/SyncWarning";

async function PostPreview({ postId }: { postId: string }) {
	const supabase = createSupabaseServerClient(cookies);

	const { post, markdown, imagesToUrls, fileNames } = await getPost(
		postId,
		supabase
	);

	const { content } = parseFrontMatter(markdown || "");

	const tagToJsx = tagToJsxConverterWithContext({
		fileNamesToUrls: imagesToUrls!,
		language: post?.language as
			| (typeof ALLOWED_LANGUAGES)[number]
			| undefined,
		imageFolder: `${post?.created_by}/${post?.id}`,
	});

	const { htmlAST } = mdToHast(content || "");
	const blogJsx = transformer(htmlAST, tagToJsx);

	return (
		<div
			className="flex flex-col items-center justify-center w-full relative
			 
		"
		>
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				fileNames={fileNames}
				blogMeta={{
					id: post.id,
					imageFolder: post.image_folder,
					blogger: post.bloggers as { id: string; name: string },
					timeStamp: post.timestamp!,
				}}
				language={post.language || undefined}
				key={postId}
			>
				{/* <PublishModal publishPostAction={publishPostAction} /> */}
				<Blog {...post} AuthorComponent={BlogAuthorServer}>
					<SyncWarning markdown={markdown} key={postId} />
					{blogJsx}

					{tagToJsx.footnotes!.length > 0 && (
						<Footers
							footNotes={tagToJsx.footnotes!}
							tagToJsxConverter={tagToJsx}
						/>
					)}
				</Blog>
				<PostPreviewControls markdown={markdown} postMeta={post} />
			</BlogContextProvider>
		</div>
	);
}
export default PostPreview;
