import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { Compartment, StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { EditorView } from "codemirror";
import { useSearchParams } from "next/navigation";
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { BiCheck } from "react-icons/bi";
import { EditorContext } from "./EditorContext";

function BlogStateUpdate({
	setBlogHtml,
}: {
	setBlogHtml: Dispatch<SetStateAction<string>>;
}) {
	const [documentMeta, setDocumentMeta] = useState({
		line: 0,
		col: 0,
		words: 0,
	});
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
						const cursorPos = update.state.selection.ranges[0].from;
						const lineAt = update.state.doc.lineAt(cursorPos);
						const markdown = update.state.sliceDoc();
						const words = markdown.split(" ").length;
						setDocumentMeta({
							line: lineAt.number,
							col: cursorPos - lineAt.from,
							words,
						});

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
	return (
		<div className="flex bg-[#15181c] px-2 gap-4 justify-end text-xs text-gray-400 py-1 border-[1px] border-t-0 border-white/30">
			<div className="">
				<span>Ln {documentMeta.line}</span>,{" "}
				<span>Col {documentMeta.col}</span>
			</div>
			<span>{documentMeta.words} words</span>
			<span className="w-24">
				<BiCheck className="inline" size={14} /> Synced locally
			</span>
		</div>
	);
}

export default BlogStateUpdate;
