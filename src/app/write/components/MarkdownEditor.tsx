import useEditor from "@/hooks/useEditor";
import { StateEffect } from "@codemirror/state";
import EditorHelperComponent from "@components/EditorHelperComponent";
import { memo, useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import langToCodeMirrorExtension from "@utils/langToExtension";

// This component should be page diagnostic.

function MarkdownEditor({ initialMarkdown }: { initialMarkdown: string }) {
	const { dispatch } = useContext(EditorContext);
	const [mounted, setMounted] = useState(false);

	const { editorView } = useEditor({
		language: "markdown",
		code: initialMarkdown,
		editorParentId: "markdown-textarea",
		mounted,
	});

	useEffect(() => {
		if (editorView) {
			dispatch({ type: "set editorView", payload: editorView });
		}
	}, [editorView]);

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, []);
	// useEffect(() => {
	// 	if (editorState.editingMarkdown) {
	// 		editorState.editorView?.focus();
	// 	}
	// }, [editorState.editingMarkdown]);
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
