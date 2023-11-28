import useEditor from "@/hooks/useEditor";
import { StateEffect } from "@codemirror/state";
import EditorHelperComponent from "@components/EditorHelperComponent";
import { memo, useContext, useEffect, useState } from "react";
import { EditorContext } from "./EditorContext";
import langToCodeMirrorExtension from "@utils/langToExtension";
import { useParams, useSearchParams } from "next/navigation";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// This component should be page diagnostic.

function MarkdownEditor({ initialMarkdown }: { initialMarkdown: string }) {
	const { dispatch, editorState } = useContext(EditorContext);
	const { documentDb } = useContext(IndexedDbContext);
	const [inSyncWithUploadedVersion, setInSyncWithUploadedVersion] =
		useState(true);
	const [localMarkdown, setLocalMarkdown] = useState("");
	const params = useParams();

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

		markdownObjectStoreRequest.onsuccess = (e: any) => {
			try {
				const { markdown } = e.target?.result as { markdown: string };
				if (markdown !== initialMarkdown && params?.postId) {
					setInSyncWithUploadedVersion(false);
					dispatch({ type: "sync locally", payload: false });

					setLocalMarkdown(markdown);
					return;
				}

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
			{!inSyncWithUploadedVersion && (
				<AlertDialog open={!inSyncWithUploadedVersion}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="flex gap-2 items-center">
								<AlertTriangle
									size={14}
									className="text-rose-500"
								/>
								Local and uploaded versions not in sync
							</AlertDialogTitle>
							<AlertDialogDescription>
								Markdowns of uploaded and local versions of this
								note are different. You can choose to ignore
								this warning and continue editing the local
								version or you can replace the current local
								version with the uploaded one
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								onClick={() => {
									setInSyncWithUploadedVersion(true);
									dispatch({
										type: "sync locally",
										payload: true,
									});
								}}
							>
								Replace local with uploaded version
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (!editorState.editorView) return;
									dispatch({
										type: "sync locally",
										payload: true,
									});
									editorState.editorView.dispatch({
										changes: [
											{
												from: 0,
												to: editorState.editorView.state
													.doc.length,
												insert: localMarkdown,
											},
										],
									});
									setInSyncWithUploadedVersion(true);
								}}
							>
								Edit local version
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
			<EditorHelperComponent />
			<div
				className={`flex-initial pb-20 lg:pb-0 overflow-y-auto  w-full`}
				id="markdown-textarea"
			></div>
		</>
	);
}

export default memo(MarkdownEditor);
