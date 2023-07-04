"use client";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { getPost } from "@/app/utils/getData";
import useShortCut from "@/hooks/useShortcut";
import { Text } from "@codemirror/state";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import BlogStateUpdate from "./BlogStateUpdate";
import { EditorContext } from "./EditorContext";
import MarkdownEditor from "./MarkdownEditor";

let initialMarkdownMeta =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function EditorLayout({
	post,
	imagesToUrls,
	markdown,
}: Partial<Awaited<ReturnType<typeof getPost>>>) {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const searchParams = useSearchParams();
	const [initialMarkdown, setInitialMarkdown] = useState(
		markdown || initialMarkdownMeta
	);
	const [blogHtml, setBlogHtml] = useState("");

	// useShortCut({
	// 	keys: ["Alt", "p"],
	// 	callback: () => {
	// 		dispatch({ type: "toggle markdown editor", payload: null });
	// 	},
	// });

	useEffect(() => {
		let postMarkdown = markdown;
		if (searchParams?.has("draft")) {
			const key = makeLocalStorageDraftKey(
				searchParams.get("draft")!,
				post?.id
			);

			let draftText = localStorage.getItem(key);
			if (draftText) {
				postMarkdown = draftText;

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
					markdown: postMarkdown,
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
			getHtmlFromMarkdownFile(markdown || "")
				.then((val) => {
					if (!val) return;

					blogStateDispatch({
						type: "set blog meta",
						payload: { ...val?.data, content: val?.content },
					});
				})
				.catch((e) => {
					alert((e as Error).message);
				});
		} else {
			dispatch({
				type: "set previous uploaded doc",
				payload: initialMarkdown,
			});
		}
	}, []);

	return (
		<div className="grow flex flex-row min-h-0 relative pt-10 gap-2">
			<div
				className={`flex flex-col basis-1/2 overflow-y-auto border-r-[1px] border-gray-500 pr-1`}
			>
				<MarkdownEditor initialMarkdown={initialMarkdown} />
				<BlogStateUpdate setBlogHtml={setBlogHtml} />
			</div>

			<div className={` basis-1/2 flex justify-center`} id="post-preview">
				<Blog
					{...blogState.blogMeta}
					content={blogHtml}
					AuthorComponent={BlogAuthorClient}
				/>
			</div>
		</div>
	);
}

export default EditorLayout;
