"use client";
import useRetrieveDraftFromIndexDb from "@/hooks/useRetrieveBlogFromIndexDb";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import PostPreviewControls from "@components/PostPreviewComponents/PostPreviewControls";
import { useContext, useEffect } from "react";

function DraftPreview({ params }: { params: { draftId: string } }) {
	const blogData = useRetrieveDraftFromIndexDb({ timeStamp: params.draftId });
	const { dispatch } = useContext(BlogContext);
	useEffect(() => {
		if (blogData) {
			dispatch({ type: "set blog meta", payload: blogData.data });
		}
	}, [blogData]);
	return (
		<div
			className="flex flex-col items-center justify-center w-full relative
			 
		"
		>
			{/* <PublishModal publishPostAction={publishPostAction} /> */}
			<Blog
				title={blogData.data?.title}
				description={blogData.data?.description}
				language={blogData.data?.language}
				content={blogData.content}
				AuthorComponent={BlogAuthorClient}
			/>
			<PostPreviewControls
				content={blogData.content}
				draftId={params.draftId}
			/>
		</div>
	);
}

export default DraftPreview;
