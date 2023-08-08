"use client";
import BlogLayout from "@/app/post/components/BlogLayout";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";

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
			ToolbarComponent={DraftToolbar}
		/>
	);
}

function DraftToolbar() {
	const params = useParams();
	return (
		<ToolTipComponent
			tip="Edit markdown"
			className={`text-gray-400 hover:text-white active:scale-95`}
		>
			<Link href={`/write?draft=${params?.draftId}`}>
				<AiFillEdit size={28} />
			</Link>
		</ToolTipComponent>
	);
}

export default Draft;
