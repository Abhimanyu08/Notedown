"use client";
import BlogLayout from "@/app/post/components/BlogLayout";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

function Draft() {
	const params = useParams();
	const [blogMarkdown, setBlogMarkdown] = useState("");
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
			setBlogMarkdown(markdown);
		};
	}, [params]);

	return (
		<BlogLayout
			postMeta={{ markdown: blogMarkdown }}
			AuthorComponent={BlogAuthorClient}
		/>
	);
}

export default Draft;