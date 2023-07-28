import { EditorContext } from "@/app/write/components/EditorContext";
import { StateEffect } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useContext, useCallback, useEffect, useState } from "react";
import { Compartment } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { usePathname } from "next/navigation";
import { SlControlStart } from "react-icons/sl";

export default function useSyncHook({ editorView, startOffset, endOffset, sandbox = false }: { editorView: EditorView | null, startOffset: number, endOffset: number, sandbox?: boolean }) {


    const markdownEditorContext = useContext(EditorContext)
    const [syncCompartment, setSyncCompartment] = useState<Compartment>()
    const pathname = usePathname()

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
        // startOffset,
        // endOffset,
        editorView,
        markdownEditorContext?.editorState?.frontMatterLength,
    ]);

    useEffect(() => {

        if (!pathname?.startsWith("/write")) return
        if (!editorView) return
        const syncPlugin = ViewPlugin.fromClass(
            class {
                insertedNewLine: boolean
                constructor() {
                    this.insertedNewLine = false
                }
                update(update: ViewUpdate) {
                    if (update.docChanged && (update.view.hasFocus || sandbox)) {
                        let code = update.state.sliceDoc()

                        let previousCodeLength = update.startState.doc.length
                        if (!this.insertedNewLine) {
                            // previousCodeLength += 1
                            code += "\n"
                        }
                        syncFunction(startOffset, startOffset + previousCodeLength, code)
                        this.insertedNewLine = true
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


    }, [editorView, startOffset])



}