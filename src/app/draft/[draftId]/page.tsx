"use client";
import BlogLayout from "@/app/post/components/BlogLayout";
import useRetrieveDraftFromIndexDb from "@/hooks/useRetrieveBlogFromIndexDb";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";

function Draft() {
	const params = useParams();
	const blogData = useRetrieveDraftFromIndexDb({
		timeStamp: params!.draftId as string,
	});
	const { dispatch } = useContext(BlogContext);
	useEffect(() => {
		if (blogData) {
			dispatch({ type: "set blog meta", payload: blogData.data });
		}
	}, [blogData]);

	return (
		<BlogLayout
			postMeta={{
				markdown: blogData.content,
				post: { ...(blogData.data as any) },
			}}
			ToolbarComponent={DraftToolbar}
			AuthorComponent={BlogAuthorClient}
		/>
	);
}

function DraftToolbar() {
	const params = useParams();
	return (
		<>
			<ToolTipComponent
				tip="Edit markdown"
				className={`text-gray-400 hover:text-white active:scale-95`}
			>
				<Link href={`/write?draft=${params?.draftId}`}>
					<AiFillEdit size={28} />
				</Link>
			</ToolTipComponent>

			<EnableRceButton />
		</>
	);
}

export default Draft;
