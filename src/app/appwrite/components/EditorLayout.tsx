"use client";
import { BlogContext } from "@/app/apppost/components/BlogState";
import useShortCut from "@/hooks/useShortcut";
import Blog from "@components/BlogPostComponents/Blog";
import { useContext, useEffect } from "react";
import { EditorContext } from "./EditorContext";
import EditorToolbar from "./EditorToolbar";
import MarkdownEditor from "./MarkdownEditor";
import { getPost } from "@/app/utils/getData";
import { useSupabase } from "@/app/appContext";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { getHtmlFromMarkdownFile } from "@utils/getResources";

const initialMarkdown =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function EditorLayout({
	post,
	imagesToUrls,
	markdown,
	userName,
}: Partial<Awaited<ReturnType<typeof getPost>>> & { userName?: string }) {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { session } = useSupabase();

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
					id: post.id,
					title: post.title,
					description: post.description,
					author: (post.bloggers as { id: string; name: string })
						.name,
					markdown,
					imageFolder: post.image_folder,
					language: post.language,
				},
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
		}
	}, []);

	useEffect(() => {
		if (editorState.editingMarkdown) return;
		getHtmlFromMarkdownFile(editorState.editorView?.state.sliceDoc() || "")
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
						editorState.editingMarkdown ? "" : "invisible"
					}`}
				>
					<MarkdownEditor
						initialMarkdown={
							blogState.blogMeta.markdown || initialMarkdown
						}
					/>
				</div>

				<div
					className={`${
						editorState.editingMarkdown
							? "hidden"
							: "overflow-y-auto w-full h-full"
					}`}
				>
					<Blog
						{...blogState.blogMeta}
						bloggers={{
							name: blogState.blogMeta.author || userName || "",
							id: session?.user.id || "",
						}}
					/>
				</div>
			</div>
			<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				<EditorToolbar />
			</div>
		</div>
	);
}

export default EditorLayout;
