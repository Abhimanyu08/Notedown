import { getHtmlFromMarkdown } from "@utils/getResources";
import { EditorView } from "codemirror";

export const convertMarkdownToContent = async (editorView: EditorView | null) => {
    if (!editorView) return;
    const markdown = editorView?.state.doc.toJSON().join("\n");
    if (!markdown) return;
    try {

        return getHtmlFromMarkdown(markdown)
    } catch (e) {

        throw e
    }
};