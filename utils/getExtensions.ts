
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from "@codemirror/view";
import { EditorView } from "codemirror";


import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";

import { ALLOWED_LANGUAGES } from "./constants";



interface getExtensionInput {
    language: typeof ALLOWED_LANGUAGES[number] | "markdown"
    blockNumber?: number;
    setRunningBlock?: ((blockNumber: number) => void) | undefined
}


function getExtensions({ language, blockNumber, setRunningBlock }: getExtensionInput): Extension[] {

    const mySetupExtensions =
        [
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
                indentWithTab,
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
                    marginLeft: "4px",
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
                    color: "rgb(34 211 238)",
                    fontSize: "16px",
                    lineHeight: "22.4px"
                }
            }, { dark: true })
        ]


    let tabSize = new Compartment();
    let languageCompartment = new Compartment();
    const langToExtension = (lang: typeof language): Extension => {
        switch (lang) {
            case "javascript":
                return languageCompartment.of(javascript())
            case "python":
                return languageCompartment.of(python())
            case "rust":
                return languageCompartment.of(rust())
            case "markdown":
                return languageCompartment.of(markdown())

        }
    }
    const importantExtensions = [
        mySetupExtensions,
        langToExtension(language),
        tabSize.of(EditorState.tabSize.of(4)),
        keymap.of([{
            key: "Shift-Enter",
            run() {
                if (!setRunningBlock || blockNumber === undefined) return false;
                setRunningBlock(blockNumber)
                return true;
            }
        }])
    ]


    return importantExtensions
}


export default getExtensions