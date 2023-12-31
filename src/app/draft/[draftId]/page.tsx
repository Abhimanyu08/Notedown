"use client";
import useRetrieveDraftFromIndexDb from "@/hooks/useRetrieveBlogFromIndexDb";
import BlogContainer from "@components/BlogContainer";
import Blog from "@components/BlogPostComponents/Blog";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import Footers from "@components/BlogPostComponents/Footers";
import SyncWarning from "@components/BlogPostComponents/SyncWarning";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { tagToJsx } from "@utils/html2Jsx/defaultJsxConverter";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
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
			dispatch({ type: "set language", payload: blogData.data.language });
		}
	}, [blogData]);

	return (
		<div className="grow flex flex-row min-h-0 relative pt-20">
			<div
				className={`lg:basis-1/5 hidden flex-col overflow-y-auto justify-start lg:flex px-4 
					`}
			>
				<Toc markdown={blogData.content} />
			</div>
			<BlogContainer
				content={blogData.content}
				title={blogData?.data.title || ""}
			>
				<Blog
					extraClasses="mx-auto"
					AuthorComponent={() => <></>}
					title={blogData.data.title}
					description={blogData.data.description}
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
			</BlogContainer>
			{/* </div> */}
			<div className="hidden lg:flex lg:flex-col lg:basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				<DraftToolbar
					postId={
						blogData.data.postId ||
						parseInt(searchParams?.get("postId") || "0") ||
						undefined
					}
				/>
			</div>
		</div>
	);
}

function DraftToolbar({ postId }: { postId?: number }) {
	const params = useParams();
	return (
		<>
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
