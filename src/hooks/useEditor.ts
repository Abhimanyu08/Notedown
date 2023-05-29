import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useEffect, useState } from 'react';


import getExtensions from "@utils/getExtensions";
import { BlogProps } from "../interfaces/BlogProps";
import { ALLOWED_LANGUAGES } from "@utils/constants";


interface useEditorProps {
    language: typeof ALLOWED_LANGUAGES[number] | "markdown"
    code: string
    editorParentId: string
    blockNumber?: number
    mounted?: boolean
}
function useEditor({ language, blockNumber, code, mounted, editorParentId }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    // const { setRunningBlock } = useContext(BlogContext)


    useEffect(() => {
        if (mounted === false) return
        const editorParent = document.getElementById(editorParentId)
        if (!editorParent) return

        editorParent?.replaceChildren("")


        let startState = EditorState.create({
            doc: code,
            extensions: getExtensions({ language, blockNumber, setRunningBlock: () => null })
        })
        let view = new EditorView({
            state: startState,
            parent: editorParent,
        });

        setEditorView(view);
    }, [code, blockNumber, mounted, language]);

    return {
        editorView
    }
}

export default useEditor