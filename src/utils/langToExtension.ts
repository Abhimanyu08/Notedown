import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";

import { Compartment, Extension } from "@codemirror/state";

import { ALLOWED_LANGUAGES } from "./constants";


let languageCompartment = new Compartment();
const langToCodeMirrorExtension = (lang: typeof ALLOWED_LANGUAGES[number] | "markdown"): Extension => {
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
export default langToCodeMirrorExtension