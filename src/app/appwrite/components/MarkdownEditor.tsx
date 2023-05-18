import EditorHelperComponent from "@components/EditorHelperComponent";
import React, { useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import useEditor from "@/hooks/useEditor";

const initialMarkdown =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function MarkdownEditor() {
	const { editorState } = useContext(EditorContext);
	const [mounted, setMounted] = useState(false);

	useEditor({
		language: "markdown",
		code: initialMarkdown,
		editorParentId: "markdown-textarea",
		mounted,
	});

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

export default MarkdownEditor;
