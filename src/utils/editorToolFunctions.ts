import { EditorView } from "codemirror";
import getUTCTimestamp from "./getUtcTimeStamp";

function insertAndChangeCursor({ editorView, toInsert, cursorOffest }: { editorView: EditorView, toInsert: string, cursorOffest: number }) {

    // const docLength =
    //     editorView?.state.doc.length;
    // if (!docLength) return;
    const cursorPos = editorView.state.selection.ranges[0].from
    editorView?.dispatch({
        changes: {
            from: cursorPos,
            insert: toInsert,
        },
    });
    editorView.focus()

}

const headingToInsert: Record<string, string> = {
    "heading2": "## ",
    "heading3": "### ",
    "heading4": "#### ",
    "heading5": "##### ",
    "heading6": "###### "
}

export const onBold = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "****", cursorOffest: 2 })
export const onItalic = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "__", cursorOffest: 1 })
export const onCodeWord = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "``", cursorOffest: 1 })
export const onCodeBlock = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "```\n \n```", cursorOffest: 4 })
export const onImage = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "\n\n![]()\n", cursorOffest: 6 })
export const onSelect = (editorView: EditorView, headingType: string) => insertAndChangeCursor({
    editorView, toInsert: headingToInsert[headingType],
    cursorOffest: headingToInsert[headingType].length
})


export const onUnordererdList = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "\n- ", cursorOffest: 3 })
export const onOrdererdList = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "\n1. ", cursorOffest: 4 })
export const onBlockQuote = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "> ", cursorOffest: 2 })
export const onLink = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "[text](link)", cursorOffest: 1 })
export const onLatex = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "`$$`", cursorOffest: 2 })
export const onCanvas = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: `\n\n\`<draw id=${getUTCTimestamp()} caption="" dark=true/>\`\n\n`, cursorOffest: 12 })

export const onSandbox = (editorView: EditorView) => insertAndChangeCursor({ editorView, toInsert: "\n```sandbox\n\n```", cursorOffest: 12 })
