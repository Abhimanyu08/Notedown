import { Compartment, StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { EditorView } from "codemirror";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useTransition } from "react";
import { EditorContext } from "../components/EditorContext";
import { parseFrontMatter } from "@utils/getResources";

function useBlogStateUpdate() {
	//This hook takes care of updating the blog state on every keypress of user on the editor
	const [blogContent, setBlogContent] = useState("");
	const { editorState, dispatch: editorStateDispatch } =
		useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const [localStorageDraftKey, setLocalStorageDraftKey] = useState("");
	const [eventHandlerCompartment, setEventHandlerCompartment] =
		useState<Compartment>();
	const searchParams = useSearchParams();
	const [_, startTransition] = useTransition();

	useEffect(() => {
		let ts = editorState.timeStamp;
		if (searchParams?.has("draft")) {
			ts = searchParams.get("draft");

			editorStateDispatch({ type: "set time stamp", payload: ts });
		}
		if (!ts) {
			const newTimeStamp = `${Date.now()}`;
			ts = newTimeStamp;
			editorStateDispatch({
				type: "set time stamp",
				payload: newTimeStamp,
			});
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
		if (!editorState.editorView || !editorState.documentDb) return;
		const stateUpdatePlugin = ViewPlugin.fromClass(
			class {
				constructor(view: EditorView) {
					const { data, content, frontMatterLength } =
						parseFrontMatter(view.state.sliceDoc());
					blogStateDispatch({
						type: "set blog meta",
						payload: {
							title: data?.title,
							description: data?.description || undefined,
							language: data?.language || undefined,
						},
					});
					editorStateDispatch({
						type: "set frontmatter length",
						payload: frontMatterLength,
					});
					setBlogContent(content);
				}

				update(update: ViewUpdate) {
					if (update.docChanged) {
						const markdown = update.state.sliceDoc();

						// localStorage.setItem(localStorageDraftKey, markdown);
						// if (!update.view.hasFocus) return;
						const { data, content, frontMatterLength } =
							parseFrontMatter(markdown);

						startTransition(() => {
							blogStateDispatch({
								type: "set blog meta",
								payload: {
									title: data?.title,
									description: data?.description || undefined,
									language: data?.language || undefined,
								},
							});

							editorStateDispatch({
								type: "set frontmatter length",
								payload: frontMatterLength,
							});
							setBlogContent(content);
						});

						let objectStore = editorState
							.documentDb!.transaction("markdown", "readwrite")
							.objectStore("markdown");
						const newData = {
							timeStamp: localStorageDraftKey,
							markdown,
						};
						objectStore.put(newData);
					}
				}
			}
		);
		if (!eventHandlerCompartment) {
			let compartment = new Compartment();

			editorState.editorView.dispatch({
				effects: StateEffect.appendConfig.of(
					compartment.of(stateUpdatePlugin.extension)
				),
			});
			setEventHandlerCompartment(compartment);
			return;
		}
		editorState.editorView.dispatch({
			effects: eventHandlerCompartment.reconfigure(
				stateUpdatePlugin.extension
			),
		});
	}, [editorState.editorView, localStorageDraftKey, editorState.documentDb]);

	return blogContent;
}

export default useBlogStateUpdate;
