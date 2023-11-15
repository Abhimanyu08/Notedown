import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useEffect, useState } from 'react';


import getExtensions from "@utils/getExtensions";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import langToCodeMirrorExtension from "@utils/langToExtension";
import themeToExtension from "@utils/themeToExtension";
import { Compartment } from "@codemirror/state";


interface useEditorProps {
    language: string
    code: string
    editorParentId: string
    theme?: string
}
function useEditor({ language, code, editorParentId, theme = "oneDark" }: useEditorProps): { editorView: EditorView | null; } {
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const [themeCompartment, setThemeCompartment] = useState<Compartment>()
    // const { setRunningBlock } = useContext(BlogContext)


    useEffect(() => {
        const editorParent = document.getElementById(editorParentId)
        if (!editorParent) return
        if (!language || (language && !Array.from([...ALLOWED_LANGUAGES, "markdown", "json"]).includes(language))) {
            return
        }


        editorParent?.replaceChildren("")


        Promise.all([langToCodeMirrorExtension(language as any), themeToExtension(theme)]).then(([langExtension, themeExtension]) => {
            const compartment = new Compartment()
            setThemeCompartment(compartment)
            let startState = EditorState.create({
                doc: code,
                extensions: [
                    langExtension,
                    compartment.of(themeExtension),
                    ...getExtensions(),
                    EditorView.theme({
                        "&": {
                            fontSize: language === "markdown" ? "0.9rem" : "1rem"
                        }
                    }),
                ]
            })
            let view = new EditorView({
                state: startState,
                parent: editorParent,
            });

            setEditorView(view);
        })
        // langToCodeMirrorExtension(language as any).then((languageExtension) => {


        // })

        return () => editorView?.destroy()

    }, [language]);

    useEffect(() => {
        if (!editorView) return

        // if code is changing in the markdown, then update this to reflect that. Earlier we were creating a new editorView on every code change which wasn't ideal.
        if (!editorView.hasFocus) {

            editorView.dispatch({
                changes: [{
                    from: 0,
                    to: editorView.state.doc.length,
                    insert: code
                }]
            })
        }
    }, [code])

    useEffect(() => {
        if (!themeCompartment) return
        themeToExtension(theme).then((themeExtension) => {

            editorView?.dispatch({
                effects: themeCompartment?.reconfigure(themeExtension)
            })
        })

    }, [theme])

    useEffect(() => {
        if (!editorView) return
        return () => {
            editorView?.destroy()
        }

    }, [editorView])

    return {
        editorView
    }
}




export default useEditor