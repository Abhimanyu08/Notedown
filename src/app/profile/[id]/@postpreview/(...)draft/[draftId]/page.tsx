"use client";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { parseFrontMatter } from "@utils/getResources";
import React, { useContext, useEffect, useState } from "react";

function DraftPreview({ params }: { params: { draftId: string } }) {
	const [blogData, setBlogData] = useState<
		ReturnType<typeof parseFrontMatter>
	>({ content: "", frontMatterLength: 0 });
	const { documentDb } = useContext(IndexedDbContext);

	useEffect(() => {
		if (!params) return;
		if (!documentDb) return;

		const draftTimeStamp = params.draftId;
		const key = `draft-${draftTimeStamp}`;

		const markdownObjectStoreRequest = documentDb
			.transaction("markdown", "readonly")
			.objectStore("markdown")
			.get(key);

		markdownObjectStoreRequest.onsuccess = (e) => {
			const { markdown } = (
				e.target as IDBRequest<{ timeStamp: string; markdown: string }>
			).result;
			setBlogData(parseFrontMatter(markdown));
		};
	}, [params, documentDb]);
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
		</div>
	);
}

export default DraftPreview;
