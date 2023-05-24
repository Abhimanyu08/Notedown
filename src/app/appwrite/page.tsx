"use client";
import useShortCut from "@/hooks/useShortcut";
import { StateEffect } from "@codemirror/state";
import { Blog } from "@components/BlogPostComponents/Blog";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import { vim } from "@replit/codemirror-vim";
import getExtensions from "@utils/getExtensions";
import { useContext, useEffect } from "react";
import BlogContextProvider, {
	BlogContext,
} from "../apppost/components/BlogState";
import { convertMarkdownToContent } from "../utils/convertMarkdownToContent";
import { EditorContext } from "./components/EditorContext";
import EditorToolbar from "./components/EditorToolbar";
import MarkdownEditor from "./components/MarkdownEditor";

function Write() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	useShortCut({
		keys: ["Alt", "p"],
		callback: () => {
			dispatch({ type: "toggle markdown editor", payload: null });
		},
	});

	useEffect(() => {
		if (editorState.editingMarkdown) return;
		convertMarkdownToContent(editorState.editorView)
			.then((val) => {
				if (!val) return;
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

	useEffect(() => {
		if (!editorState.editorView) return;

		if (editorState.enabledVimForMarkdown) {
			editorState.editorView.dispatch({
				effects: StateEffect.reconfigure.of([
					vim(),
					...getExtensions({
						language: "markdown",
					}),
				]),
			});
		}

		if (!editorState.enabledVimForMarkdown) {
			editorState.editorView.dispatch({
				effects: StateEffect.reconfigure.of(
					getExtensions({
						language: "markdown",
					})
				),
			});
		}
	}, [editorState.enabledVimForMarkdown]);

	return (
		<div className="grow flex flex-row min-h-0 relative pt-10">
			<div
				className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start flex
					`}
			>
				<Toc html={blogState.blogMeta.content} />
			</div>
			<div
				className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden`}
			>
				<div
					className={`absolute top-0 left-0 w-full h-full ${
						editorState.editingMarkdown ? "" : "invisible"
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
						editorState.editingMarkdown ? "invisible" : "px-20"
					}
				/>
			</div>
			<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				<EditorToolbar />
			</div>
		</div>
	);
}

export default Write;
