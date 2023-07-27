import { EditorContext } from "@/app/write/components/EditorContext";
import { StateEffect } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useContext, useCallback, useEffect, useState } from "react";
import { Compartment } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

export default function useSyncHook({ editorView, startOffset, endOffset, sandbox = false }: { editorView: EditorView | null, startOffset: number, endOffset: number, sandbox?: boolean }) {


    const markdownEditorContext = useContext(EditorContext)
    const [syncCompartment, setSyncCompartment] = useState<Compartment>()

    const syncFunction = useCallback((start?: number, end?: number, code?: string) => {
        // this function syncs the codeblocks code to the markdown editor
        if (!markdownEditorContext || !editorView) return;
        const { editorState } = markdownEditorContext;
        const { editorView: markdownEditorView, frontMatterLength } =
            editorState;
        const newCode = code || editorView.state.sliceDoc()
        markdownEditorView?.dispatch({
            changes: [
                {
                    from: frontMatterLength + (start || startOffset),
                    to: frontMatterLength + (end || endOffset),
                    insert: newCode,

                }
            ],

        });
    }, [
        startOffset,
        endOffset,
        editorView,
        markdownEditorContext?.editorState?.frontMatterLength,
    ]);

    useEffect(() => {

        if (!editorView) return
        const syncPlugin = ViewPlugin.fromClass(
            class {
                update(update: ViewUpdate) {
                    if (update.docChanged && (update.view.hasFocus || sandbox)) {
                        const code = update.state.sliceDoc()
                        const previousCode = update.startState.sliceDoc()
                        syncFunction(startOffset, startOffset + previousCode.length, code)
                    }
                }
            })

        if (!syncCompartment) {
            const compartment = new Compartment()
            editorView?.dispatch({
                effects: StateEffect.appendConfig.of(compartment.of(syncPlugin.extension))
            })
            setSyncCompartment(compartment)
            return
        }
        editorView?.dispatch({
            effects: syncCompartment.reconfigure(syncPlugin.extension)
        })


    }, [editorView, startOffset, endOffset])



}