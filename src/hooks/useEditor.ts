import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useContext, useEffect, useRef, useState } from 'react';


import getExtensions from "../../utils/getExtensions";
import { BlogProps } from "../interfaces/BlogProps";
import { BlogContext } from '../pages/_app';


interface useEditorProps {
    language: BlogProps["language"] | "markdown"
    code: string
    blockNumber?: number
    mounted?: boolean
}
function useEditor({ language, blockNumber, code, mounted }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const { collectCodeTillBlock } = useContext(BlogContext)
    const elemId = useRef(language === "markdown" ? "markdown-textarea" : `codearea-${blockNumber}`)


    useEffect(() => {
        if (mounted === false) return
        document.getElementById(elemId.current)?.replaceChildren("")

        let startState = EditorState.create({
            doc: code,
            extensions: getExtensions({ language, blockNumber, collectCodeTillBlock })
        })

        let view = new EditorView({
            state: startState,
            parent: document.getElementById(elemId.current)!,
        });

        setEditorView(view);
    }, [collectCodeTillBlock, code, blockNumber, mounted, language]);

    return {
        editorView
    }
}

export default useEditor