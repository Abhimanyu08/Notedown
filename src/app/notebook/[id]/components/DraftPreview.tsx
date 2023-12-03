"use client";
import PostPreviewControls from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreviewControls";
import useRetrieveDraftFromIndexDb from "@/hooks/useRetrieveBlogFromIndexDb";
import Blog from "@components/BlogPostComponents/Blog";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import Footers from "@components/BlogPostComponents/Footers";
import SyncWarning from "@components/BlogPostComponents/SyncWarning";
import { tagToJsx } from "@utils/html2Jsx/defaultJsxConverter";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";

function DraftPreview({ params }: { params: { draftId: string } }) {
	const blogData = useRetrieveDraftFromIndexDb({ timeStamp: params.draftId });
	const searchParams = useSearchParams();
	const { dispatch } = useContext(BlogContext);
	useEffect(() => {
		if (blogData) {
			dispatch({ type: "set language", payload: blogData.data.language });
		}
	}, [blogData]);
	return (
		<div
			className="flex flex-col items-center justify-center w-full relative
			 
		"
		>
			{/* <PublishModal publishPostAction={publishPostAction} /> */}
			<Blog
				title={blogData.data.title}
				description={blogData.data.description}
				AuthorComponent={() => <></>}
			>
				<SyncWarning />
				{transformer(mdToHast(blogData.content).htmlAST, tagToJsx)}
				{tagToJsx.footnotes!.length > 0 && (
					<Footers
						footNotes={tagToJsx.footnotes!}
						tagToJsxConverter={tagToJsx}
					/>
				)}
			</Blog>
			<PostPreviewControls
				markdown={blogData.content}
				postMeta={{
					timestamp: params.draftId,
					id:
						blogData.data.postId ||
						parseInt(searchParams?.get("postId") || "0") ||
						undefined,
				}}
			/>
		</div>
	);
}

export default DraftPreview;
