import useEditor from "@/hooks/useEditor";
import { StateEffect } from "@codemirror/state";
import EditorHelperComponent from "@components/EditorHelperComponent";
import { memo, useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import langToCodeMirrorExtension from "@utils/langToExtension";
import { useSearchParams } from "next/navigation";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";

// This component should be page diagnostic.

function MarkdownEditor({ initialMarkdown }: { initialMarkdown: string }) {
	const { dispatch, editorState } = useContext(EditorContext);
	const { documentDb } = useContext(IndexedDbContext);

	const { editorView } = useEditor({
		language: "markdown",
		code: initialMarkdown,
		editorParentId: "markdown-textarea",
	});

	const searchParams = useSearchParams();

	useEffect(() => {
		if (editorView) {
			dispatch({ type: "set editorView", payload: editorView });
		}
	}, [editorView]);

	useEffect(() => {
		// This is for when user loads the drafts. Initialmarkdown will change after we read from localstorage.
		if (!editorView || !documentDb) return;

		const draftTimeStamp = searchParams?.get("draft");
		if (!draftTimeStamp) return;
		const key = draftTimeStamp;

		const markdownObjectStoreRequest = documentDb
			.transaction("markdown", "readonly")
			.objectStore("markdown")
			.get(key);

		markdownObjectStoreRequest.onsuccess = (e) => {
			try {
				const { markdown } = (
					e.target as IDBRequest<{
						timeStamp: string;
						markdown: string;
					}>
				).result;
				editorView.dispatch({
					changes: [
						{
							from: 0,
							to: editorView.state.doc.length,
							insert: markdown,
						},
					],
				});
			} catch {
				dispatch({ type: "sync locally", payload: false });
			}
		};
	}, [editorView, documentDb]);

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
