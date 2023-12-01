/* eslint-disable react-hooks/exhaustive-deps */
import { Compartment, StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { EditorView } from "codemirror";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useTransition } from "react";
import { EditorContext } from "../components/EditorContext";
import { parseFrontMatter } from "@utils/parseFrontMatter";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { initialMarkdownMeta } from "@utils/constants";

function useBlogStateUpdate() {
	//This hook takes care of updating the blog state on every keypress of user on the editor
	const [blogContent, setBlogContent] = useState("");
	const { editorState, dispatch: editorStateDispatch } =
		useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { documentDb } = useContext(IndexedDbContext);
	const [indexMdStoreKey, setIndexMdStoreKey] = useState("");
	const searchParams = useSearchParams();
	const [localSyncCompartment, setLocalSyncCompartment] =
		useState<Compartment>();
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

		setIndexMdStoreKey(ts);
	}, []);

	useEffect(() => {
		//this state plugin will handle syncing the markdown locally to indexstorage
		if (!documentDb || !indexMdStoreKey || !editorState.editorView) return;

		if (!editorState.syncLocally) {
			if (localSyncCompartment) {
				// stop syncing & delete the record from object store
				editorState.editorView.dispatch({
					effects: localSyncCompartment.reconfigure([]),
				});
				const mdObjectStore = getMarkdownObjectStore(documentDb);
				mdObjectStore.delete(indexMdStoreKey);
			}
			return;
		}
		const compartment = new Compartment();
		setLocalSyncCompartment(compartment);
		const stateUpdatePlugin = ViewPlugin.fromClass(
			class {
				constructor(view: EditorView) {
					const markdown = view.state.sliceDoc();

					if (markdown === initialMarkdownMeta) return; //don't sync in local storage when user hasn't made any change
					const { data } = parseFrontMatter(markdown);
					updateMarkdownInIndexDb(
						documentDb!,
						indexMdStoreKey,
						markdown,
						data.tags
					);
				}
				update(update: ViewUpdate) {
					if (update.docChanged) {
						const markdown = update.state.sliceDoc();

						// localStorage.setItem(localStorageDraftKey, markdown);
						// if (!update.view.hasFocus) return;

						const { data } = parseFrontMatter(markdown);
						updateMarkdownInIndexDb(
							documentDb,
							indexMdStoreKey,
							markdown,
							data.tags
						);
					}
				}
			}
		);
		editorState.editorView.dispatch({
			effects: StateEffect.appendConfig.of(
				compartment.of(stateUpdatePlugin.extension)
			),
		});
	}, [
		editorState.syncLocally,
		indexMdStoreKey,
		documentDb,
		editorState.editorView,
	]);

	useEffect(() => {
		if (!editorState.editorView || !documentDb || !indexMdStoreKey) return;
		const stateUpdatePlugin = ViewPlugin.fromClass(
			class {
				constructor(view: EditorView) {
					const markdown = view.state.sliceDoc();

					const { data, frontMatterLength } =
						parseFrontMatter(markdown);
					editorStateDispatch({
						type: "set frontmatter length",
						payload: frontMatterLength,
					});
					blogStateDispatch({
						type: "set language",
						payload: data.language,
					});

					setBlogContent(markdown);
				}

				update(update: ViewUpdate) {
					if (update.docChanged) {
						const markdown = update.state.sliceDoc();

						// localStorage.setItem(localStorageDraftKey, markdown);
						// if (!update.view.hasFocus) return;
						const { data, frontMatterLength } =
							parseFrontMatter(markdown);

						startTransition(() => {
							editorStateDispatch({
								type: "set frontmatter length",
								payload: frontMatterLength,
							});
							blogStateDispatch({
								type: "set language",
								payload: data.language,
							});
							setBlogContent(markdown);
						});
					}
				}
			}
		);
		editorState.editorView.dispatch({
			effects: StateEffect.appendConfig.of(stateUpdatePlugin.extension),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorState.editorView, indexMdStoreKey, documentDb]);

	return blogContent;
}

function updateMarkdownInIndexDb(
	db: IDBDatabase,
	key: string,
	markdown: string,
	tags?: string[]
) {
	const mdObjectStore = getMarkdownObjectStore(db);
	const mdReq = mdObjectStore.get(key);

	mdReq.onsuccess = () => {
		const previousData = mdReq.result;
		if (!previousData) {
			// markdown with this key doesn't exist in index store currently.
			const newData = {
				timeStamp: key,
				markdown,
				tags,
			};
			mdObjectStore.put(newData);
			return;
		}
		// data with this key exists, just update the markdown
		previousData.markdown = markdown;
		previousData.tags = tags;

		mdObjectStore.put(previousData);
	};
}

export default useBlogStateUpdate;
