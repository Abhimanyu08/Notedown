import { Compartment, StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { EditorView } from "codemirror";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useTransition } from "react";
import { EditorContext } from "../components/EditorContext";
import { parseFrontMatter } from "@utils/getResources";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";

function useBlogStateUpdate() {
	//This hook takes care of updating the blog state on every keypress of user on the editor
	const [blogContent, setBlogContent] = useState("");
	const { editorState, dispatch: editorStateDispatch } =
		useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { documentDb } = useContext(IndexedDbContext);
	const [indexMdStoreKey, setIndexMdStoreKey] = useState("");
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

		setIndexMdStoreKey(ts);
	}, []);

	useEffect(() => {
		if (!editorState.editorView || !documentDb || !indexMdStoreKey) return;
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
						const { data, frontMatterLength } =
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
							setBlogContent(markdown);
						});
						updateMarkdown(
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
			effects: StateEffect.appendConfig.of(stateUpdatePlugin.extension),
		});
	}, [editorState.editorView, indexMdStoreKey, documentDb]);

	return blogContent;
}

function updateMarkdown(
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
