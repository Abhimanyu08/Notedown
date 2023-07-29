import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useEffect, useState } from 'react';


import getExtensions from "@utils/getExtensions";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import langToCodeMirrorExtension from "@utils/langToExtension";


interface useEditorProps {
    language: string
    code: string
    editorParentId: string
    mounted?: boolean
}
function useEditor({ language, code, editorParentId }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    // const { setRunningBlock } = useContext(BlogContext)


    useEffect(() => {
        const editorParent = document.getElementById(editorParentId)
        if (!editorParent) return
        if (!language || (language && !Array.from([...ALLOWED_LANGUAGES, "markdown", "json"]).includes(language))) {
            language = "javascript"
        }


        editorParent?.replaceChildren("")


        langToCodeMirrorExtension(language as any).then((languageExtension) => {

            let startState = EditorState.create({
                doc: code,
                extensions: [
                    languageExtension,
                    ...getExtensions()
                ]
            })
            let view = new EditorView({
                state: startState,
                parent: editorParent,
            });

            setEditorView(view);
        })

    }, [language]);

    useEffect(() => {
        if (!editorView) return

        // if code is changing in the markdown, then update this to reflect that. Earlier we were creating a new editorView on every code change which wasn't ideal.
        if (!editorView.hasFocus) {

            editorView.dispatch({
                changes: [{
                    from: 0,
                    to: editorView.state.doc.length,
                    insert: code
                }]
            })
        }
    }, [code])

    useEffect(() => {
        if (!editorView) return
        return () => {
            editorView?.destroy()
        }

    }, [editorView])

    return {
        editorView
    }
}

export default useEditor