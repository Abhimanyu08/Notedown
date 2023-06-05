import { getHtmlFromMarkdownFile } from "@utils/getResources";
import { EditorView } from "codemirror";

export const convertMarkdownToContent = async (editorView: EditorView | null) => {
    if (!editorView) return;
    const markdown = editorView?.state.sliceDoc();
    if (!markdown) return;
    try {

        return getHtmlFromMarkdownFile(markdown)
    } catch (e) {

        throw e
    }
};