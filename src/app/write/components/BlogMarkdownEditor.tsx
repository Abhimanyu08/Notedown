"use client";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import React, { useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import MarkdownEditor from "./MarkdownEditor";
import { BiCheck, BiSync } from "react-icons/bi";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { BlogContext } from "@/app/post/components/BlogState";
import getExtensions from "@utils/getExtensions";
import langToCodeMirrorExtension from "@utils/langToExtension";
import { useSearchParams } from "next/navigation";
import { getHtmlFromMarkdownFile } from "@utils/getResources";

function BlogMarkdownEditor({ initialMarkdown }: { initialMarkdown: string }) {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	// const [documentMeta, setDocumentMeta] = useState({
	// 	line: 0,
	// 	col: 0,
	// 	words: 0,
	// });
	// const [timestamp, setTimestamp] = useState("");
	const [hideDocumentMetadata, setHideDocumentMetadata] = useState(false);
	const [localStorageDraftKey, setLocalStorageDraftKey] = useState("");
	const [eventHandlerCompartment, setEventHandlerCompartment] =
		useState<Compartment>();
	const searchParams = useSearchParams();

	const eventHandler = (v: EditorView) => {
		const cursorPos = v.state.selection.ranges[0].from;
		const lineAt = v.state.doc.lineAt(cursorPos);
		const words = v.state.sliceDoc().split(" ").length;
		// setDocumentMeta({
		// 	line: lineAt.number,
		// 	col: cursorPos - lineAt.from,
		// 	words,
		// });
	};

	useEffect(() => {
		let ts = editorState.timeStamp;
		if (searchParams?.has("draft")) {
			ts = searchParams.get("draft");

			dispatch({ type: "set time stamp", payload: ts });
		}
		if (!ts) {
			const newTimeStamp = `${Date.now()}`;
			ts = newTimeStamp;
			dispatch({ type: "set time stamp", payload: newTimeStamp });
		}

		let localStorageKey = makeLocalStorageDraftKey(
			ts,
			blogState.blogMeta.id
		);

		if (localStorageKey !== localStorageDraftKey) {
			localStorage.removeItem(localStorageDraftKey);
			setLocalStorageDraftKey(localStorageKey);
		}
	}, [blogState.blogMeta.id]);

	useEffect(() => {
		if (!editorState.editorView) return;

		const docSizePlugin = ViewPlugin.fromClass(
			class {
				dom: HTMLDivElement;
				constructor(view: EditorView) {
					this.dom = view.dom.appendChild(
						document.createElement("div")
					);
					this.dom.style.cssText =
						"position: absolute; inset-block-start: 2px; inset-inline-end: 5px";
					this.dom.textContent = "" + view.state.doc.length;
				}

				update(update: ViewUpdate) {
					if (update.docChanged) {
						this.dom.textContent = "" + update.state.doc.length;
						getHtmlFromMarkdownFile(
							update.state.sliceDoc() || ""
						).then((val) => {
							if (!val) return;
							if (
								blogState.blogMeta.language !==
									val.data.language &&
								blogState.containerId
							) {
								blogStateDispatch({
									type: "remove container",
									payload: null,
								});
							}
							blogStateDispatch({
								type: "set blog meta",
								payload: {
									...val?.data,
									content: val?.content,
								},
							});
						});
					}
				}

				destroy() {
					this.dom.remove();
				}
			}
		);

		editorState.editorView.dispatch({
			effects: StateEffect.appendConfig.of([docSizePlugin.extension]),
		});
	}, [editorState.editorView]);

	// useEffect(() => {
	// 	if (editorState.editorView && localStorageDraftKey) {
	// 		let editorView = editorState.editorView;

	// 		if (!eventHandlerCompartment) {
	// 			let compartment = new Compartment();
	// 			editorView.dispatch({
	// 				effects: StateEffect.appendConfig.of(
	// 					compartment.of([
	// 						EditorView.domEventHandlers({
	// 							keyup: (_, v) => {
	// 								eventHandler(v);

	// 								localStorage.setItem(
	// 									localStorageDraftKey,
	// 									v.state.sliceDoc()
	// 								);
	// 							},
	// 							click: (_, v) => eventHandler(v),
	// 							focus: (_, v) => eventHandler(v),
	// 						}),
	// 					])
	// 				),
	// 			});

	// 			setEventHandlerCompartment(compartment);
	// 			return;
	// 		}
	// 		editorView.dispatch({
	// 			effects: eventHandlerCompartment.reconfigure([
	// 				EditorView.domEventHandlers({
	// 					keyup: (_, v) => {
	// 						eventHandler(v);

	// 						localStorage.setItem(
	// 							localStorageDraftKey,
	// 							v.state.sliceDoc()
	// 						);
	// 					},
	// 					click: (_, v) => eventHandler(v),
	// 					focus: (_, v) => eventHandler(v),
	// 				}),
	// 			]),
	// 		});
	// 		setEventHandlerCompartment(undefined);
	// 	}
	// }, [editorState.editorView, localStorageDraftKey]);

	return (
		<>
			<MarkdownEditor initialMarkdown={initialMarkdown} />
			{/* {hideDocumentMetadata ? (
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
			)} */}
		</>
	);
}

export default BlogMarkdownEditor;
