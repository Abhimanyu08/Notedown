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
function useEditor({ language, code, mounted, editorParentId }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    // const { setRunningBlock } = useContext(BlogContext)


    useEffect(() => {
        if (mounted === false) return
        const editorParent = document.getElementById(editorParentId)
        if (!editorParent) return
        if (language && !Array.from([...ALLOWED_LANGUAGES, "markdown"]).includes(language)) code = `You specified ${language} as the language. Only supported languages are rust,python and javascript`
        if (!language) code = "Please specify a language in the frontmatter"

        editorParent?.replaceChildren("")


        langToCodeMirrorExtension(language as typeof ALLOWED_LANGUAGES[number] || "markdown").then((languageExtension) => {

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

    }, [code, mounted, language]);
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