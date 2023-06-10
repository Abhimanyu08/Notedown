"use client";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import React, { useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import { EditorView } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import MarkdownEditor from "./MarkdownEditor";
import { BiCheck, BiSync } from "react-icons/bi";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { BlogContext } from "@/app/apppost/components/BlogState";
import getExtensions from "@utils/getExtensions";
import langToCodeMirrorExtension from "@utils/langToExtension";

function BlogMarkdownEditor({
	initialMarkdown,
	postId,
}: {
	initialMarkdown: string;
	postId?: number;
}) {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState } = useContext(BlogContext);
	const [documentMeta, setDocumentMeta] = useState({
		line: 0,
		col: 0,
		words: 0,
	});
	// const [timestamp, setTimestamp] = useState("");
	const [hideDocumentMetadata, setHideDocumentMetadata] = useState(false);

	const eventHandler = (v: EditorView) => {
		const cursorPos = v.state.selection.ranges[0].from;
		const lineAt = v.state.doc.lineAt(cursorPos);
		const words = v.state.sliceDoc().split(" ").length;
		setDocumentMeta({
			line: lineAt.number,
			col: cursorPos - lineAt.from,
			words,
		});
	};
	useEffect(() => {
		if (editorState.editorView && !editorState.enabledVimForMarkdown) {
			let ts = editorState.timeStamp;
			if (!ts) {
				const newTimeStamp = `${Date.now()}`;
				ts = newTimeStamp;
				dispatch({ type: "set time stamp", payload: newTimeStamp });
			}

			let localStorageKey = makeLocalStorageDraftKey(ts, postId);
			let editorView = editorState.editorView;

			editorView.dispatch({
				effects: StateEffect.appendConfig.of(
					EditorView.domEventHandlers({
						keyup: (_, v) => {
							eventHandler(v);

							localStorage.setItem(
								localStorageKey,
								v.state.sliceDoc()
							);
						},
						click: (_, v) => eventHandler(v),
						focus: (_, v) => eventHandler(v),
					})
				),
			});
			editorView.focus();
		}
		//we neeed to rerun this effect on enabling vim for markdown cause enabling vim rewrites the entire exntesion list of the editor and this will throw away our domhandler extension.
	}, [editorState.editorView, editorState.enabledVimForMarkdown]);

	useEffect(() => {
		//if user uploads a post, blogState.blogMeta.id changes. At that point we need to reattach the event listener that saves draft cause localStorageDraftKeys change now.
		if (!blogState.blogMeta.id || postId) return;
		let localStorageKey = makeLocalStorageDraftKey(
			editorState.timeStamp!,
			blogState.blogMeta.id
		);
		editorState.editorView!.dispatch({
			effects: StateEffect.reconfigure.of([
				...getExtensions(),
				langToCodeMirrorExtension("markdown"),
				EditorView.domEventHandlers({
					keyup: (_, v) => {
						eventHandler(v);

						localStorage.setItem(
							localStorageKey,
							v.state.sliceDoc()
						);
					},
				}),
			]),
		});
	}, [blogState.blogMeta.id]);

	// useEffect(() => {
	// 	if (syncing) {
	// 		setTimeout(() => {
	// 			setSyncing(false);
	// 		}, 1000);
	// 	}
	// }, [syncing]);
	return (
		<>
			<MarkdownEditor initialMarkdown={initialMarkdown} />
			{hideDocumentMetadata ? (
				<button
					className="bg-[#15181c] self-end w-fit border-[1px] border-t-0 border-white/30 text-xs text-gray-400 hover:font-bold px-2 py-1 no-scale"
					onClick={() => setHideDocumentMetadata(false)}
				>
					Show
				</button>
			) : (
				<div className="flex bg-[#15181c] px-2 gap-4 justify-end text-xs text-gray-400 py-1 border-[1px] border-t-0 border-white/30">
					<div className="">
						<span>Ln {documentMeta.line}</span>,{" "}
						<span>Col {documentMeta.col}</span>
					</div>
					<span>{documentMeta.words} words</span>
					<span className="w-24">
						<BiCheck className="inline" size={14} /> Synced locally
					</span>
					<span
						className="rounded-sm hover:font-bold cursor-pointer"
						onClick={() => setHideDocumentMetadata(true)}
					>
						Hide
					</span>
				</div>
			)}
		</>
	);
}

export default BlogMarkdownEditor;
