import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useEffect, useState } from 'react';


import getExtensions from "@utils/getExtensions";
import { BlogProps } from "../interfaces/BlogProps";
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
        if (!editorParent || !language) return
        if (!Array.from([...ALLOWED_LANGUAGES, "markdown"]).includes(language)) return

        editorParent?.replaceChildren("")


        let startState = EditorState.create({
            doc: code,
            extensions: [
                langToCodeMirrorExtension(language as typeof ALLOWED_LANGUAGES[number] || "markdown"),
                ...getExtensions()
            ]
        })
        let view = new EditorView({
            state: startState,
            parent: editorParent,
        });

        setEditorView(view);
        return () => {
            view.destroy()
        }
    }, [code, mounted, language]);

    return {
        editorView
    }
}

export default useEditor