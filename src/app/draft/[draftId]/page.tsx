"use client";
import BlogLayout from "@/app/post/components/BlogLayout";
import useRetrieveDraftFromIndexDb from "@/hooks/useRetrieveBlogFromIndexDb";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";

function Draft() {
	const params = useParams();
	const blogData = useRetrieveDraftFromIndexDb({
		timeStamp: params!.draftId as string,
	});
	const searchParams = useSearchParams();
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
			ToolbarComponent={() => (
				<DraftToolbar
					postId={
						blogData.data.postId ||
						parseInt(searchParams?.get("postId") || "0") ||
						undefined
					}
				/>
			)}
			AuthorComponent={() => <></>}
		/>
	);
}

function DraftToolbar({ postId }: { postId?: number }) {
	const params = useParams();
	return (
		<>
			<EnableRceButton />
			<ToolTipComponent
				tip="Edit markdown"
				className={`text-gray-400 hover:text-white active:scale-95`}
			>
				<Link
					href={
						postId
							? `/write/${postId}?draft=${params?.draftId}`
							: `/write?draft=${params?.draftId}`
					}
				>
					<AiFillEdit size={28} />
				</Link>
			</ToolTipComponent>
		</>
	);
}

export default Draft;
