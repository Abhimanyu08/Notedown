import useEditor from "@/hooks/useEditor";
import { StateEffect } from "@codemirror/state";
import EditorHelperComponent from "@components/EditorHelperComponent";
import { memo, useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import langToCodeMirrorExtension from "@utils/langToExtension";

// This component should be page diagnostic.

function MarkdownEditor({ initialMarkdown }: { initialMarkdown: string }) {
	const { dispatch } = useContext(EditorContext);

	const { editorView } = useEditor({
		language: "markdown",
		code: initialMarkdown,
		editorParentId: "markdown-textarea",
	});

	useEffect(() => {
		if (editorView) {
			dispatch({ type: "set editorView", payload: editorView });
		}
	}, [editorView]);

	useEffect(() => {
		// This is for when user loads the drafts. Initialmarkdown will change after we read from localstorage.
		if (!editorView) return;

		if (editorView.state.sliceDoc() !== initialMarkdown) {
			editorView.dispatch({
				changes: [
					{
						from: 0,
						to: editorView.state.doc.length,
						insert: initialMarkdown,
					},
				],
			});
		}
	}, [initialMarkdown, editorView]);

	return (
		<>
			<EditorHelperComponent />
			<div
				className={`flex-initial pb-20 lg:pb-0 overflow-y-auto  w-full`}
				id="markdown-textarea"
			></div>
		</>
	);
}

export default memo(MarkdownEditor);
