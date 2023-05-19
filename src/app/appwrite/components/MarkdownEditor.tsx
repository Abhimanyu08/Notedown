import EditorHelperComponent from "@components/EditorHelperComponent";
import React, { memo, useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import useEditor from "@/hooks/useEditor";

const initialMarkdown =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function MarkdownEditor() {
	const { editorState, dispatch } = useContext(EditorContext);
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
	useEffect(() => {
		if (editorState.editingMarkdown) {
			editorState.editorView?.focus();
		}
	}, [editorState.editingMarkdown]);
	return (
		<>
			<EditorHelperComponent />
			<div
				className={`grow pb-20 lg:pb-0 overflow-y-auto  w-full`}
				id="markdown-textarea"
			></div>
		</>
	);
}

export default memo(MarkdownEditor);