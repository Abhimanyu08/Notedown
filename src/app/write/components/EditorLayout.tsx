"use client";
import { getPost } from "@/app/utils/getData";
import { Text } from "@codemirror/state";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "./EditorContext";
import MarkdownEditor from "./MarkdownEditor";
import OptionsToolbar from "./OptionsToolbar";
import useBlogStateUpdate from "../hooks/useBlogStateUpdate";

let initialMarkdownMeta =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function EditorLayout({
	post,
	imagesToUrls,
	markdown,
	fileNames,
}: Partial<Awaited<ReturnType<typeof getPost>>>) {
	const { dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const searchParams = useSearchParams();
	const [initialMarkdown, setInitialMarkdown] = useState(
		markdown || initialMarkdownMeta
	);
	const blogContent = useBlogStateUpdate();
	const previewRef = useRef<HTMLDivElement>(null);
	const [atEnd, setAtEnd] = useState(false);

	useEffect(() => {
		if (searchParams?.has("draft")) {
			const key = makeLocalStorageDraftKey(
				searchParams.get("draft")!,
				post?.id
			);

			let draftText = localStorage.getItem(key);
			if (draftText) {
				setInitialMarkdown(draftText);
			}
		}
		if (post) {
			blogStateDispatch({
				type: "set blog meta",
				payload: {
					id: post.id,
					title: post.title,
					description: post.description,
					author: (post.bloggers as { id: string; name: string })
						.name,
					imageFolder: post.image_folder,
					language: post.language,
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
				type: "add sandbox filenames",
				payload: fileNames,
			});
		} else {
			dispatch({
				type: "set previous uploaded doc",
				payload: initialMarkdown,
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

	return (
		<div className="grow flex flex-row min-h-0 relative  gap-2 ">
			<div
				className={`flex flex-col basis-1/2 overflow-y-auto pt-10 border-r-[1px] border-gray-500 pr-1`}
			>
				<MarkdownEditor initialMarkdown={initialMarkdown} />
			</div>
			<OptionsToolbar content={blogContent} />

			<div
				className={` basis-1/2  pt-10
				overflow-y-auto
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				pl-8

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
					if (val < 5) {
						if (!atEnd) setAtEnd(true);
						return;
					}
					if (atEnd) setAtEnd(false);
				}}
			>
				<Blog
					{...blogState.blogMeta}
					content={blogContent}
					AuthorComponent={BlogAuthorClient}
				/>
				{/* <Toc markdown={blogContent} /> */}
			</div>
		</div>
	);
}

export default EditorLayout;
