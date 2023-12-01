"use client";
import { getPost } from "@utils/getData";
import { Text } from "@codemirror/state";
import Blog from "@components/BlogPostComponents/Blog";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EditorContext } from "./EditorContext";
import MarkdownEditor from "./MarkdownEditor";
import WriteToolbar from "./WriteToolbar";
import useBlogStateUpdate from "../hooks/useBlogStateUpdate";
import { initialMarkdownMeta } from "@utils/constants";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { tagToJsx } from "@utils/html2Jsx/defaultJsxConverter";
import { parseFrontMatter } from "@utils/parseFrontMatter";
import Footers from "@components/BlogPostComponents/Footers";

function EditorLayout({
	post,
	imagesToUrls,
	markdown,
	fileNames,
}: Partial<Awaited<ReturnType<typeof getPost>>>) {
	const { dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const blogContent = useBlogStateUpdate();
	const previewRef = useRef<HTMLDivElement>(null);
	const [atEnd, setAtEnd] = useState(false);

	useEffect(() => {
		if (post) {
			blogStateDispatch({
				type: "set blog meta",
				payload: {
					id: post.id,
					author: (post.bloggers as { id: string; name: string })
						.name,
					imageFolder: post.image_folder,
					blogger: post.bloggers as any,
					slug: post.slug || undefined,
					published: post.published,
				},
			});
			dispatch({
				type: "set previous uploaded doc",
				payload: Text.of([markdown!]),
			});

			blogStateDispatch({
				type: "set uploaded images",
				payload: imagesToUrls!,
			});
			blogStateDispatch({
				type: "set language",
				payload: post.language,
			});
			blogStateDispatch({
				type: "add sandbox filenames",
				payload: fileNames,
			});
		}
	}, []);

	useEffect(() => {
		// if user has scrolled to the bottom of the preview (atEnd = true) then whenever he adds new content the scroll position of view should adjust accordingly.
		if (!atEnd) return;
		if (!previewRef || !previewRef.current) return;

		previewRef.current?.scrollTo({
			top:
				previewRef.current.scrollHeight -
				previewRef.current.clientHeight,
			left: 0,
		});
	}, [blogContent]);

	const blogMeta = useMemo(() => {
		const { data, content } = parseFrontMatter(blogContent);
		return { title: data.title, description: data.description, content };
	}, [blogContent]);

	return (
		<div className="grow flex flex-row min-h-0 relative  gap-2 ">
			<div
				className={`flex flex-col basis-[45%] overflow-y-auto pt-10 border-r-[1px] border-gray-500 pr-1`}
			>
				<MarkdownEditor
					initialMarkdown={markdown || initialMarkdownMeta}
				/>
			</div>

			<WriteToolbar content={blogContent} />
			<div
				className={` grow  my-10
				overflow-y-auto
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				scroll-smooth   

				`}
				id="post-preview"
				ref={previewRef}
				onScroll={(e) => {
					const val = Math.abs(
						e.currentTarget.clientHeight +
							Math.ceil(e.currentTarget.scrollTop) -
							e.currentTarget.scrollHeight
					);
					if (val < 300) {
						if (!atEnd) setAtEnd(true);
						return;
					}
					if (atEnd) setAtEnd(false);
				}}
			>
				<Blog
					title={blogMeta.title}
					description={blogMeta.description}
					AuthorComponent={() => <></>}
				>
					{transformer(mdToHast(blogMeta.content).htmlAST, tagToJsx)}
					{tagToJsx.footnotes && tagToJsx.footnotes.length > 0 && (
						<Footers
							footNotes={tagToJsx.footnotes}
							tagToJsxConverter={tagToJsx}
						/>
					)}
				</Blog>
			</div>
		</div>
	);
}

export default EditorLayout;
