import { getHtmlFromMarkdown } from "@utils/getResources";
import { EditorView } from "codemirror";

export const convertMarkdownToContent = async (editorView: EditorView | null) => {
    if (!editorView) return;
    const markdown = editorView?.state.doc.toJSON().join("\n");
    console.log(markdown)
    if (!markdown) return;
    try {

        return getHtmlFromMarkdown(markdown)
    } catch (e) {

        throw e
        //This workaround is because keyup event is not fired in case of error
        // const altKeyUp = new KeyboardEvent("keyup", {
        // 	key: "Alt",
        // 	altKey: true,
        // });
        // const pKeyUp = new KeyboardEvent("keyup", {
        // 	key: "p",
        // });
        // document.dispatchEvent(altKeyUp);
        // document.dispatchEvent(pKeyUp);
    }
};