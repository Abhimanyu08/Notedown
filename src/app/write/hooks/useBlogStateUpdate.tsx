import { Compartment, StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { EditorView } from "codemirror";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";

function useBlogStateUpdate() {
	//This hook takes care of updating the blog state on every keypress of user on the editor
	const [blogHtml, setBlogHtml] = useState("");
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const [localStorageDraftKey, setLocalStorageDraftKey] = useState("");
	const [eventHandlerCompartment, setEventHandlerCompartment] =
		useState<Compartment>();
	const searchParams = useSearchParams();

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
			setLocalStorageDraftKey(localStorageKey);
		}
	}, [blogState.blogMeta.id]);

	useEffect(() => {
		if (!editorState.editorView) return;

		const docSizePlugin = ViewPlugin.fromClass(
			class {
				constructor(view: EditorView) {
					getHtmlFromMarkdownFile(view.state.sliceDoc() || "").then(
						(val) => {
							blogStateDispatch({
								type: "set blog meta",
								payload: val?.data,
							});
							setBlogHtml(val.content);
						}
					);
				}

				update(update: ViewUpdate) {
					if (update.docChanged) {
						const markdown = update.state.sliceDoc();

						localStorage.setItem(localStorageDraftKey, markdown);
						getHtmlFromMarkdownFile(markdown || "").then((val) => {
							if (!val) return;

							blogStateDispatch({
								type: "set blog meta",
								payload: {
									title: val.data.title,
									description:
										val.data.description || undefined,
									language: val.data.language || undefined,
								},
							});
							setBlogHtml(val.content);
						});
					}
				}
			}
		);
		if (!eventHandlerCompartment) {
			let compartment = new Compartment();

			editorState.editorView.dispatch({
				effects: StateEffect.appendConfig.of(
					compartment.of(docSizePlugin.extension)
				),
			});
			setEventHandlerCompartment(compartment);
			return;
		}
		editorState.editorView.dispatch({
			effects: eventHandlerCompartment.reconfigure(
				docSizePlugin.extension
			),
		});
	}, [editorState.editorView, localStorageDraftKey]);

	return blogHtml;
}

export default useBlogStateUpdate;
