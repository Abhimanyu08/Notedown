
import { Compartment, Extension } from "@codemirror/state";

import { ALLOWED_LANGUAGES } from "./constants";
import { linter, lintGutter } from "@codemirror/lint"
import { StreamLanguage } from "@codemirror/language"



import * as eslint from "eslint-linter-browserify";


let languageCompartment = new Compartment();
const langToCodeMirrorExtension = async (lang: typeof ALLOWED_LANGUAGES[number] | "markdown" | "json"): Promise<Extension> => {
    switch (lang) {
        case "javascript":
            const { javascript, esLint } = await import("@codemirror/lang-javascript")

            const config = {
                // eslint configuration
                parserOptions: {
                    ecmaVersion: 2023,
                    sourceType: "module",
                },
                env: {
                    node: true,
                },
                rules: {
                    semi: ["error", "never"],
                },
            };
            return languageCompartment.of([javascript({ jsx: true, typescript: true }), linter(esLint(new eslint.Linter(), config))])
        case "python":
            const { python } = await import("@codemirror/lang-python")
            return languageCompartment.of(python())
        case "rust":
            const { rust } = await import("@codemirror/lang-rust")
            return languageCompartment.of(rust())
        case "markdown":
            const { markdown } = await import("@codemirror/lang-markdown")
            return languageCompartment.of(markdown())

        case "json":
            const { json, jsonParseLinter } = await import("@codemirror/lang-json")
            return languageCompartment.of([json(), linter(jsonParseLinter()), lintGutter()])

        case "go":

            const { go } = await import("@codemirror/legacy-modes/mode/go");
            return StreamLanguage.define(go)

        default:
            return []

    }
}
export default langToCodeMirrorExtension