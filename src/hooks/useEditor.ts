import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useContext, useEffect, useState } from 'react';


import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from "@codemirror/view";
import { BlogContext } from '../pages/_app';
import { BlogProps } from "../interfaces/BlogProps";


interface useEditorProps {
    language: BlogProps["language"]
    code: string
    blockNumber: number
}
function useEditor({ language, blockNumber, code }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const { collectCodeTillBlock } = useContext(BlogContext)

    useEffect(() => {

        document.getElementById(`codearea-${blockNumber}`)?.replaceChildren("");
        let languageCompartment = new Compartment();
        let tabSize = new Compartment();

        const mySetup: Extension = (() => [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap
            ]),
            EditorView.theme({
                "&": {
                    color: "#fff",
                    backgroundColor: "rgb(0 0 0)",
                },
                ".cm-content": {
                    caretColor: "#0e9",
                    marginLeft: "4px"
                },
                "&.cm-focused .cm-cursor": {
                    borderLeftColor: "#0e9"
                },
                "&.cm-focused .cm-selectionBackground, ::selection": {
                    backgroundColor: "rgb(56 189 248)"
                },
                ".cm-gutters": {
                    backgroundColor: "rgb(0 0 0)",
                    color: "#ddd",
                    borderRightWidth: "1px",
                    borderColor: "#fff",
                },
                ".cm-gutterElement": {
                    color: "rgb(34 211 238)"
                }
            }, { dark: true })
        ])()

        const langToExtension = (lang: typeof language): Extension => {
            switch (lang) {
                case "javascript":
                    return languageCompartment.of(javascript())
                case "python":
                    return languageCompartment.of(python())
                case "rust":
                    return languageCompartment.of(rust())

            }
        }
        let startState = EditorState.create({
            doc: code,
            extensions: [
                mySetup,
                langToExtension(language),
                tabSize.of(EditorState.tabSize.of(4)),
                keymap.of([{
                    key: "Shift-Enter",
                    run() {
                        if (!collectCodeTillBlock) return false;
                        collectCodeTillBlock(blockNumber)
                        return true;
                    }
                }])
            ],
        });

        let view = new EditorView({
            state: startState,
            parent: document.getElementById(`codearea-${blockNumber}`)!,
        });

        setEditorView(view);
    }, [collectCodeTillBlock]);

    return {
        editorView
    }
}

export default useEditor