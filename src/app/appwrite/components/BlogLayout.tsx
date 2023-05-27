"use client";
import { BlogContext } from "@/app/apppost/components/BlogState";
import { convertMarkdownToContent } from "@/app/utils/convertMarkdownToContent";
import useShortCut from "@/hooks/useShortcut";
import { Blog } from "@components/BlogPostComponents/Blog";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import { useContext, useEffect } from "react";
import { EditorContext } from "./EditorContext";
import EditorToolbar from "./EditorToolbar";
import MarkdownEditor from "./MarkdownEditor";
import { getPost } from "@/app/utils/getData";

function BlogLayout({
	post,
	imagesToUrls,
	markdown,
}: Awaited<ReturnType<typeof getPost>>) {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	useShortCut({
		keys: ["Alt", "p"],
		callback: () => {
			dispatch({ type: "toggle markdown editor", payload: null });
		},
	});

	useEffect(() => {
		if (post) {
			blogStateDispatch({
				type: "set blog meta",
				payload: {
					title: post.title,
					description: post.description,
					author: post.bloggers?.name,
					markdown,
					imageFolder: post.image_folder,
					language: post.language,
				},
			});

			blogStateDispatch({
				type: "set uploaded images",
				payload: imagesToUrls,
			});
		}
	}, []);

	useEffect(() => {
		if (editorState.editingMarkdown) return;
		convertMarkdownToContent(editorState.editorView)
			.then((val) => {
				if (!val) return;
				if (
					blogState.blogMeta.language !== val.data.language &&
					blogState.containerId
				) {
					blogStateDispatch({
						type: "remove container",
						payload: null,
					});
				}
				blogStateDispatch({
					type: "set blog meta",
					payload: { ...val?.data, content: val?.content },
				});
			})
			.catch((e) => {
				alert((e as Error).message);
				dispatch({ type: "toggle markdown editor", payload: null });
				// This workaround is because keyup event is not fired in case of error
				const altKeyUp = new KeyboardEvent("keyup", {
					key: "Alt",
					altKey: true,
				});
				const pKeyUp = new KeyboardEvent("keyup", {
					key: "p",
				});
				document.dispatchEvent(altKeyUp);
				document.dispatchEvent(pKeyUp);
			});
	}, [editorState.editingMarkdown]);

	return (
		<div className="grow flex flex-row min-h-0 relative pt-10">
			<div
				className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start flex
					`}
			>
				<Toc html={blogState.blogMeta.content || ""} />
			</div>
			<div
				className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden`}
			>
				<div
					className={`absolute flex flex-col top-0 left-0 w-full h-full overflow-y-auto ${
						editorState.editingMarkdown ? "" : "hidden"
					}`}
				>
					<MarkdownEditor />
				</div>

				<Blog
					{...blogState.blogMeta}
					bloggers={{
						name: "hello",
					}}
					extraClasses={
						editorState.editingMarkdown ? "hidden" : "px-20"
					}
				/>
			</div>
			<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				<EditorToolbar />
			</div>
		</div>
	);
}

export default BlogLayout;
