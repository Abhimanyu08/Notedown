import { EditorContext } from "@/app/write/components/EditorContext";
import { EditorView } from "codemirror";
import { useContext, useCallback, useEffect } from "react";

export default function useSyncHook({ editorView, startOffset, endOffset, id }: { editorView: EditorView | null, startOffset: number, endOffset: number, id: string }) {


    const markdownEditorContext = useContext(EditorContext)

    const syncFunction = useCallback(() => {
        // this function syncs the codeblocks code to the markdown editor
        if (!markdownEditorContext || !editorView) return;
        const { editorState } = markdownEditorContext;
        const { editorView: markdownEditorView, frontMatterLength } =
            editorState;
        const newCode = editorView.state.sliceDoc().trim();
        if (!startOffset || !endOffset) {
            console.log("no start or end");
            return;
        }
        markdownEditorView?.dispatch({
            changes: [
                {
                    from: frontMatterLength + startOffset,
                    to: frontMatterLength + endOffset,
                    insert: newCode + "\n",
                },
            ],
        });
    }, [
        startOffset,
        endOffset,
        editorView,
        markdownEditorContext?.editorState?.frontMatterLength,
    ]);

    useEffect(() => {
        if (!markdownEditorContext) return;
        const { dispatch } = markdownEditorContext;
        dispatch({
            type: "set sync state",
            payload: { [id]: false },
        });

        return () => {
            dispatch({
                type: "remove sync state",
                payload: id,
            });
        };
    }, []);

    useEffect(() => {
        if (
            markdownEditorContext.editorState.syncingCodeBlock ===
            id
        ) {
            syncFunction();
            markdownEditorContext.dispatch({
                type: "set sync state",
                payload: { [id]: true },
            });
        }
    }, [markdownEditorContext?.editorState.syncingCodeBlock]);
    return syncFunction
}