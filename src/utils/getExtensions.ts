
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, HighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from "@codemirror/view";
import { EditorView } from "codemirror";


// import {  } from "@codemirror/t";
import { tags as t } from "@lezer/highlight";
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
            // syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            oneDarkTheme,
            syntaxHighlighting(oneDarkHighlightStyle),
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
                    backgroundColor: "#101317",
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
            }, { dark: true }),
        ]


    let tabSize = new Compartment();
    let languageCompartment = new Compartment();
    const langToExtension = (lang: typeof language): Extension => {
        switch (lang) {
            case "javascript":
                return languageCompartment.of(javascript({ jsx: true, typescript: true }))
            case "python":
                return languageCompartment.of(python())
            case "rust":
                return languageCompartment.of(rust())
            case "markdown":
                return languageCompartment.of(markdown())

        }
    }
    const importantExtensions = [
        EditorView.lineWrapping,
        langToExtension(language),
        mySetupExtensions,
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

const chalky = "#e5c07b",
    coral = "#e06c75",
    cyan = "#56b6c2",
    invalid = "#ffffff",
    ivory = "#abb2bf",
    stone = "#7d8799", // Brightened compared to original to increase contrast
    malibu = "#61afef",
    sage = "#98c379",
    whiskey = "#d19a66",
    violet = "#c678dd",
    darkBackground = "#15181c",
    highlightBackground = "#2c313a",
    background = "#21252b",
    tooltipBackground = "#353a42",
    selection = "#3E4451",
    cursor = "#528bff"

/// The colors used in the theme, as CSS color strings.
// const color = {
//     chalky,
//     coral,
//     cyan,
//     invalid,
//     ivory,
//     stone,
//     malibu,
//     sage,
//     whiskey,
//     violet,
//     darkBackground,
//     highlightBackground,
//     background,
//     tooltipBackground,
//     selection,
//     cursor
// }

/// The editor theme styles for One Dark.
const oneDarkTheme = EditorView.theme({
    "&": {
        color: ivory,
        backgroundColor: darkBackground
    },

    ".cm-content": {
        caretColor: cursor
    },

    ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: selection },

    ".cm-panels": { backgroundColor: darkBackground, color: ivory },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

    ".cm-searchMatch": {
        backgroundColor: "#72a1ff59",
        outline: "1px solid #457dff"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#6199ff2f"
    },

    ".cm-activeLine": { backgroundColor: "#6699ff0b" },
    ".cm-selectionMatch": { backgroundColor: "#aafe661a" },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: "#bad0f847"
    },

    ".cm-gutters": {
        backgroundColor: darkBackground,
        color: stone,
    },

    ".cm-activeLineGutter": {
        backgroundColor: highlightBackground
    },

    ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "#ddd"
    },

    ".cm-tooltip": {
        border: "none",
        backgroundColor: tooltipBackground
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: tooltipBackground,
        borderBottomColor: tooltipBackground
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
            backgroundColor: highlightBackground,
            color: ivory
        }
    }
}, { dark: true })

/// The highlighting style for code in the One Dark theme.
const oneDarkHighlightStyle = HighlightStyle.define([
    {
        tag: t.keyword,
        color: violet
    },
    {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: coral
    },
    {
        tag: [t.function(t.variableName), t.labelName],
        color: malibu
    },
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: whiskey
    },
    {
        tag: [t.definition(t.name), t.separator],
        color: ivory
    },
    {
        tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
        color: chalky
    },
    {
        tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
        color: cyan
    },
    {
        tag: [t.meta, t.comment],
        color: stone
    },
    {
        tag: t.strong,
        fontWeight: "bold"
    },
    {
        tag: t.emphasis,
        fontStyle: "italic"
    },
    {
        tag: t.strikethrough,
        textDecoration: "line-through"
    },
    {
        tag: t.link,
        color: stone,
        textDecoration: "underline"
    },
    {
        tag: t.heading,
        fontWeight: "bold",
        color: coral
    },
    {
        tag: [t.atom, t.bool, t.special(t.variableName)],
        color: whiskey
    },
    {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: sage
    },
    {
        tag: t.invalid,
        color: invalid
    },
])

/// Extension to enable the One Dark theme (both the editor theme and
/// the highlight style).
const oneDark: Extension = [oneDarkTheme, syntaxHighlighting(oneDarkHighlightStyle)]

export default getExtensions