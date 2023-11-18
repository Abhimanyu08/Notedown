
import { Compartment, Extension } from "@codemirror/state";

import { ALLOWED_LANGUAGES } from "./constants";
import { linter, lintGutter } from "@codemirror/lint"
import { StreamLanguage } from "@codemirror/language"


import { autocompletion } from "@codemirror/autocomplete"

import * as eslint from "eslint-linter-browserify";

import {
    createDefaultMapFromCDN,
    createSystem,
    createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import ts from "typescript"

import {
    tsLinter,
    tsHover,
    tsAutocomplete,
    tsSync,
} from '@valtown/codemirror-ts';




let languageCompartment = new Compartment();
const langToCodeMirrorExtension = async (lang: typeof ALLOWED_LANGUAGES[number] | "markdown" | "json"): Promise<Extension> => {
    switch (lang) {
        case "javascript":
            const { javascript, esLint } = await import("@codemirror/lang-javascript")

            const fsMap = await createDefaultMapFromCDN(
                { target: ts.ScriptTarget.ES2022 },
                "3.7.3",
                true,
                ts,
            );
            const system = createSystem(fsMap);
            const compilerOpts = {};
            const env = createVirtualTypeScriptEnvironment(system, [], ts, compilerOpts);
            const path = 'index.ts'

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
            return [languageCompartment.of(javascript({ jsx: true, typescript: true })), tsSync({ env, path }), tsLinter({ env, path }), autocompletion({
                override: [tsAutocomplete({ env, path })]
            }), tsHover({ env, path })]
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