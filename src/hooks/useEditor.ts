import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useContext, useEffect, useRef, useState } from 'react';


import { BlogProps } from "../interfaces/BlogProps";
import getExtensions from "@utils/getExtensions";
import { EditorContext } from "@/app/appwrite/components/EditorContext";


interface useEditorProps {
    language: BlogProps["language"] | "markdown"
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

<<<<<<< HEAD

=======
        console.log(view.lineWrapping)
>>>>>>> 07b091aeb26595ae919724f54f81f5b9e6b5cd75
        setEditorView(view);
    }, [code, blockNumber, mounted, language]);

    return {
        editorView
    }
}

export default useEditor