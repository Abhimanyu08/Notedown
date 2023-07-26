
import { Compartment, Extension } from "@codemirror/state";

import { ALLOWED_LANGUAGES } from "./constants";


let languageCompartment = new Compartment();
const langToCodeMirrorExtension = async (lang: typeof ALLOWED_LANGUAGES[number] | "markdown"): Promise<Extension> => {
    switch (lang) {
        case "javascript":
            const { javascript } = await import("@codemirror/lang-javascript")

            return languageCompartment.of(javascript({ jsx: true, typescript: true }))
        case "python":
            const { python } = await import("@codemirror/lang-python")
            return languageCompartment.of(python())
        case "rust":
            const { rust } = await import("@codemirror/lang-rust")
            return languageCompartment.of(rust())
        case "markdown":
            const { markdown } = await import("@codemirror/lang-markdown")
            return languageCompartment.of(markdown())
        default:
            return []

    }
}
export default langToCodeMirrorExtension