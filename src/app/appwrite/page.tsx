"use client";
import { StateEffect } from "@codemirror/state";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import EditorToolbar from "./components/EditorToolbar";
import MarkdownEditor from "./components/MarkdownEditor";
import { useCallback, useContext, useEffect } from "react";
import { EditorContext } from "./components/EditorContext";
import { Blog } from "@components/BlogPostComponents/Blog";
import useShortCut from "@/hooks/useShortcut";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { EditorView } from "codemirror";
import { convertMarkdownToContent } from "../utils/convertMarkdownToContent";
import { vim } from "@replit/codemirror-vim";
import getExtensions from "@utils/getExtensions";

function Write() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogMeta } = editorState;

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
				dispatch({
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
				<Toc html={editorState.blogMeta.content} />
			</div>
			<div
				className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden`}
			>
				<div
					className={
						editorState.editingMarkdown ? "h-full" : "invisible"
					}
				>
					<MarkdownEditor />
				</div>
				<Blog
					{...blogMeta}
					bloggers={{
						name: "hello",
					}}
					extraClasses={
						(editorState.editingMarkdown ? "invisible" : "") +
						" absolute top-0 left-0 px-20"
					}
				/>
			</div>
			<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white ml-10 mt-20">
				<EditorToolbar />
			</div>
		</div>
	);
}

export default Write;
